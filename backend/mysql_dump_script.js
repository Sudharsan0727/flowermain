const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function dumpForMySQL() {
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
  `);
  
  let sql = '';
  
  for (const row of tables.rows) {
    const tableName = row.table_name;
    console.log(`Processing table: ${tableName}`);
    
    // 1. Get Columns Schema
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    
    // Create Table (simplified MySQL)
    sql += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sql += `CREATE TABLE \`${tableName}\` (\n`;
    
    const colDefs = columns.rows.map(col => {
      let type = col.data_type.toUpperCase();
      let colName = col.column_name.toLowerCase();

      // Better type mapping
      if (type === 'CHARACTER VARYING' || type === 'VARCHAR') {
        // Use LONGTEXT for common large data columns to avoid "Data too long"
        if (['value', 'description', 'content', 'config', 'payload', 'note', 'message', 'data', 'bio', 'summary'].includes(colName)) {
           type = 'MEDIUMTEXT';
        } else {
           type = `VARCHAR(${col.character_maximum_length || 255})`;
        }
      }
      else if (type === 'INTEGER') type = 'INT';
      else if (type === 'BIGINT') type = 'BIGINT';
      else if (type === 'TEXT') type = 'MEDIUMTEXT';
      else if (type === 'BOOLEAN') type = 'TINYINT(1)';
      else if (type.includes('TIMESTAMP')) type = 'DATETIME';
      else if (type === 'UUID') type = 'CHAR(36)';
      else if (type === 'JSONB' || type === 'JSON' || type === 'ARRAY') type = 'JSON';
      else if (type === 'USER-DEFINED') type = 'VARCHAR(255)'; // For enums
      
      let def = `  \`${col.column_name}\` ${type}`;
      if (col.is_nullable === 'NO') def += ' NOT NULL';
      
      // Handle defaults
      if (col.column_default) {
          if (col.column_default.includes('nextval')) {
              // Primary key skip default for now, just mark auto_increment later
          } else if (!col.column_default.includes('::')) {
              def += ` DEFAULT ${col.column_default}`;
          }
      }
      
      return def;
    });
    
    sql += colDefs.join(',\n');
    
    // Primary Key (assumed 'id' if exists)
    const hasId = columns.rows.some(c => c.column_name === 'id');
    if (hasId) {
       sql += `,\n  PRIMARY KEY (\`id\`)`;
    }
    
    sql += `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n`;
    
    // 2. Get Data
    const data = await pool.query(`SELECT * FROM "${tableName}"`);
    if (data.rows.length > 0) {
      const colNames = columns.rows.map(c => `\`${c.column_name}\``).join(', ');
      
      for (const dataRow of data.rows) {
        const values = columns.rows.map(col => {
           let val = dataRow[col.column_name];
           if (val === null) return 'NULL';
           if (typeof val === 'boolean') return val ? '1' : '0';
           if (typeof val === 'object' && val instanceof Date) return `'${val.toISOString().replace('T', ' ').replace('Z', '')}'`;
           if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
           if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
           return val;
        }).join(', ');
        
        sql += `INSERT INTO \`${tableName}\` (${colNames}) VALUES (${values});\n`;
      }
    }
    sql += '\n';
  }
  
  fs.writeFileSync('mysql_friendly_dump.sql', sql, 'utf8');
  console.log('Successfully created mysql_friendly_dump.sql');
  process.exit();
}

dumpForMySQL().catch(err => {
    console.error(err);
    process.exit(1);
});
