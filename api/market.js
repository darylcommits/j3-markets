export default async function handler(req, res) {
  const action = req.query.action;
  const symbol = req.query.symbol;
  const interval = req.query.interval || '5min';
  
  // Use environment variable in production, fallback to provided key for development
  const apiKey = process.env.TWELVEDATA_API_KEY || '47be2fc8370d45b0b35c0d5b9f6860b7';
  
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing' });
  }

  try {
    if (action === 'watchlist') {
      const symbols = req.query.symbols || 'XAU/USD,EUR/USD,GBP/USD,USD/JPY,IXIC,DJI';
      const url = `https://api.twelvedata.com/quote?symbol=${symbols}&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return res.status(200).json(data);
    } 
    else if (action === 'timeseries') {
      let tdSymbol = symbol;
      if (symbol && symbol.length === 6 && !symbol.includes('/')) {
        tdSymbol = symbol.substring(0,3) + '/' + symbol.substring(3,6);
      }
      if (symbol === 'US30') tdSymbol = 'DJI';
      if (symbol === 'NAS100') tdSymbol = 'IXIC';

      const intervalMap = { M1:'1min', M5:'5min', M15:'15min', M30:'30min', H1:'1h', H4:'4h', D1:'1day' };
      const tdInterval = intervalMap[interval] || '5min';
      
      const url = `https://api.twelvedata.com/time_series?symbol=${tdSymbol}&interval=${tdInterval}&outputsize=250&apikey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'error') {
        return res.status(400).json(data);
      }
      return res.status(200).json(data);
    }
    
    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
