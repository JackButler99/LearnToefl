/** Server-controlled deployment mode; never derive it from a cookie or query parameter. */
export function isPortfolioDemo(){return process.env.PORTFOLIO_DEMO==="1";}
