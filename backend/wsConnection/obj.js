class KeyValue {
  _MarketOpen = {
    OPEN_WITHIN_VALUE: "OPEN_WITHIN_VALUE",
    OPEN_OUTSIDE_VALUE_IN_RANGE: "OPEN_OUTSIDE_VALUE_IN_RANGE",
    OPEN_OUTSIDE_RANGE_HIGH: "OPEN_OUTSIDE_RANGE_HIGH",
    OPEN_OUTSIDE_RANGE_LOW: "OPEN_OUTSIDE_RANGE_LOW",
  };

  _MarketNotOpen = {
    MNO: "Market Not Open",
  };

  _Exchange = {
    NSE: "NSE",
    NFO: "NFO",
    MCX: "MCX",
    BSE: "BSE",
    CDS: "CDS",
    BCD: "BCD",
  };

  _InstrumentType = {
    FUT: "FUT",
    CE: "CE",
    EQ: "EQ",
    PE: "PE",
  };

  _Segment = {
    BCD: "BCD",
    BCD_FUT: "BCD_FUT",
    BCD_OPT: "BCD_OPT",
    CDS_FUT: "CDS_FUT",
    CDS_OPT: "CDS_OPT",
    MCX_FUT: "MCX_FUT",
    MCX_OPT: "MCX_OPT",
    NFO_FUT: "NFO_FUT",
    NFO_OPT: "NFO_OPT",
    BSE: "BSE",
    INDICES: "INDICES",
    NSE: "NSE",
  };

  _PriceBehavior = {
    BREAKING_VALUE_UP: "BREAKING_VALUE_UP",
    BREAKING_VALUE_DOWN: "BREAKING_VALUE_DOWN",
    BREAKING_RANGE_UP: "BREAKING_RANGE_UP",
    BREAKING_RANGE_DOWN: "BREAKING_RANGE_DOWN",
    BREAKING_RANGE_DOWN_UP: "BREAKING_RANGE_DOWN_UP",
    BREAKING_RANGE_UP_DOWN: "BREAKING_RANGE_UP_DOWN",
    RESISTS: "RESISTS",
    SUPPORTS: "SUPPORTS",
  };

  _TPO = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
    F: "F",
    G: "G",
    H: "H",
    I: "I",
    J: "J",
    K: "K",
    L: "L",
    M: "M",
  };

  MARKET_START_HOUR = 9;
  MARKET_START_MINUTE = 15;
  MARKET_END_HOUR = 3;
  MARKET_END_MINUTE = 30;
}

module.exports = KeyValue;
