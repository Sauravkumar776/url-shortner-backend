async function generateShortCode() {
    const { nanoid } = await import('nanoid');
    return nanoid(6);
  }
  
  module.exports = { generateShortCode };
  
module.exports = {generateShortCode}