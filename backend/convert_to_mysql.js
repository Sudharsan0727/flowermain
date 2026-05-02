const fs = require('fs');

async function convert() {
  const content = fs.readFileSync('tables_utf8.sql', 'utf8');
  const lines = content.split('\n');
  const out = [];

  for (let line of lines) {
    let trim = line.trim();
    
    // Skip PG overhead
    if (!trim || trim.startsWith('--') || trim.startsWith('SET ') || 
        trim.startsWith('SELECT pg_catalog.set_config') || 
        trim.startsWith('SELECT pg_catalog.setval') || 
        trim.startsWith('\\') || trim.startsWith('ALTER TYPE') || 
        trim.startsWith('CREATE TYPE')) {
      continue;
    }

    // Skip ownership and search path stuff
    if (trim.includes('OWNER TO') || trim.includes('EXTENSION')) {
      continue;
    }

    // Replace PG types/prefixes for MySQL
    // 1. Remove schema (public.)
    line = line.replace(/public\./g, '');

    // 2. Double quotes -> Backticks
    line = line.replace(/"/g, '`');

    // 3. PostgreSQL Types to MySQL
    line = line.replace(/timestamp with time zone/gi, 'DATETIME');
    line = line.replace(/timestamp without time zone/gi, 'DATETIME');
    line = line.replace(/character varying\((\d+)\)/gi, 'VARCHAR($1)');
    line = line.replace(/character varying/gi, 'VARCHAR(255)');
    line = line.replace(/boolean/gi, 'TINYINT(1)');
    line = line.replace(/integer/gi, 'INT');
    line = line.replace(/text/gi, 'TEXT');
    line = line.replace(/UUID/gi, 'VARCHAR(36)');

    // 4. Remove Postgres type casts
    line = line.replace(/::\b\w+\b/g, '');

    // 5. Constraints clean
    if (line.includes('ADD CONSTRAINT')) {
      line = line.replace(/ADD CONSTRAINT `[^`]+` (PRIMARY KEY|UNIQUE|FOREIGN KEY)/gi, 'ADD $1');
    }

    // 6. Boolean literals: , true, -> , 1,
    line = line.replace(/,\s?true/gi, ', 1');
    line = line.replace(/,\s?false/gi, ', 0');
    line = line.replace(/\(true/gi, '(1');
    line = line.replace(/\(false/gi, '(0');

    // Remove PG specific schema check if it missed it
    if (line.includes('public`')) line = line.replace(/public`/g, '');
    
    out.push(line);
  }

  fs.writeFileSync('mysql_backup.sql', out.join('\n'), 'utf8');
  console.log('Conversion successful. File: mysql_backup.sql');
}

convert();
