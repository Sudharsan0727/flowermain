async function testUpdatePromo() {
  try {
    const res = await fetch('http://localhost:5000/api/banners/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        promoBadge: 'TEST BADGE',
        promoTitle: 'TEST TITLE',
        promoSubtitle: 'TEST SUBTITLE',
        promoInfo: 'TEST INFO'
      })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
testUpdatePromo();
