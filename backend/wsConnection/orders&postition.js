var axios = require("axios");
var csvParse = require("papaparse");
var sha256 = require("crypto-js/sha256");
var querystring = require("querystring");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "./config.env") });
const API_KEY = process.env.API_KEY;



class KiteConnect {
  constructor(params) {
    this.api_key = API_KEY;
    this.root = params.root || "https://api.kite.trade";
    this.timeout = params.timeout || 7000;
    this.debug = params.debug || false;
    this.access_token = params.access_token || null;
    this.default_login_uri = "https://kite.trade/connect/login";
    this.session_expiry_hook = null;
    this.kiteVersion = 3;
  }

  // Constants
  // Products
  api_key = "";
  PRODUCT_MIS = "MIS";
  PRODUCT_CNC = "CNC";
  PRODUCT_NRML = "NRML";
  PRODUCT_CO = "CO";
  PRODUCT_BO = "BO";

  // Order types

  ORDER_TYPE_MARKET = "MARKET";
  ORDER_TYPE_LIMIT = "LIMIT";
  ORDER_TYPE_SLM = "SL-M";
  ORDER_TYPE_SL = "SL";

  // Varities

  VARIETY_REGULAR = "regular";
  VARIETY_BO = "bo";
  VARIETY_CO = "co";
  VARIETY_AMO = "amo";

  // Transaction type

  TRANSACTION_TYPE_BUY = "BUY";
  TRANSACTION_TYPE_SELL = "SELL";

  // Validity

  VALIDITY_DAY = "DAY";
  VALIDITY_IOC = "IOC";

  // Exchanges

  EXCHANGE_NSE = "NSE";
  EXCHANGE_BSE = "BSE";
  EXCHANGE_NFO = "NFO";
  EXCHANGE_CDS = "CDS";
  EXCHANGE_BCD = "BCD";
  EXCHANGE_BFO = "BFO";
  EXCHANGE_MCX = "MCX";

  // Margins segments

  MARGIN_EQUITY = "equity";
  MARGIN_COMMODITY = "commodity";
  STATUS_CANCELLED = "CANCELLED";
  STATUS_REJECTED = "REJECTED";
  STATUS_COMPLETE = "COMPLETE";
  GTT_TYPE_OCO = "two-leg";
  GTT_TYPE_SINGLE = "single";
  GTT_STATUS_ACTIVE = "active";
  GTT_STATUS_TRIGGERED = "triggered";
  GTT_STATUS_DISABLED = "disabled";
  GTT_STATUS_EXPIRED = "expired";
  GTT_STATUS_CANCELLED = "cancelled";
  GTT_STATUS_REJECTED = "rejected";
  GTT_STATUS_DELETED = "deleted";
  POSITION_TYPE_DAY = "day";
  POSITION_TYPE_OVERNIGHT = "overnight";

  routes = {
    "api.token": "/session/token",
    "api.token.invalidate": "/session/token",
    "api.token.renew": "/session/refresh_token",
    "user.profile": "/user/profile",
    "user.margins": "/user/margins",
    "user.margins.segment": "/user/margins/{segment}",
    orders: "/orders",
    trades: "/trades",
    "order.info": "/orders/{order_id}",
    "order.place": "/orders/{variety}",
    "order.modify": "/orders/{variety}/{order_id}",
    "order.cancel": "/orders/{variety}/{order_id}",
    "order.trades": "/orders/{order_id}/trades",
    "order.margins": "/margins/orders",
    "order.margins.basket": "/margins/basket",
    "portfolio.positions": "/portfolio/positions",
    "portfolio.holdings": "/portfolio/holdings",
    "portfolio.positions.convert": "/portfolio/positions",
    "mf.orders": "/mf/orders",
    "mf.order.info": "/mf/orders/{order_id}",
    "mf.order.place": "/mf/orders",
    "mf.order.cancel": "/mf/orders/{order_id}",
    "mf.sips": "/mf/sips",
    "mf.sip.info": "/mf/sips/{sip_id}",
    "mf.sip.place": "/mf/sips",
    "mf.sip.modify": "/mf/sips/{sip_id}",
    "mf.sip.cancel": "/mf/sips/{sip_id}",
    "mf.holdings": "/mf/holdings",
    "mf.instruments": "/mf/instruments",
    "market.instruments.all": "/instruments",
    "market.instruments": "/instruments/{exchange}",
    "market.historical":
      "/instruments/historical/{instrument_token}/{interval}",
    "market.trigger_range": "/instruments/trigger_range/{transaction_type}",
    "market.quote": "/quote",
    "market.quote.ohlc": "/quote/ohlc",
    "market.quote.ltp": "/quote/ltp",
    "gtt.triggers": "/gtt/triggers",
    "gtt.trigger_info": "/gtt/triggers/{trigger_id}",
    "gtt.place": "/gtt/triggers",
    "gtt.modify": "/gtt/triggers/{trigger_id}",
    "gtt.delete": "/gtt/triggers/{trigger_id}",
  };

  setAccessToken(access_token) {
    this.access_token = access_token;
  }

  setSessionExpiryHook(cb) {
    this.session_expiry_hook = cb;
  }
  ////     # Orders

  getOrderHistory(order_id) {
    return  _get("order.info", {"order_id": order_id}, null, formatResponse);
  };

  getTrades() {
    return _get("trades", null, null, formatResponse);
  };

  getOrderTrades = function(order_id) {
    return  _get("order.trades", {"order_id": order_id}, null, formatResponse);
  };

  orderMargins = function(orders, mode=null) {
    return _post("order.margins", orders, null, null, true,
                {"mode":mode});
  };

  orderMargins = function(orders, mode=null) {
    return _post("order.margins", orders, null, null, true,
                {"mode":mode});
  };
  ////     # end of orders

  ////     # Mutual fund
  getMFOrders(order_id) {
    if (order_id) {
      return _get(
        "mf.order.info",
        { order_id: order_id },
        null,
        formatResponse
      );
    } else {
      return _get("mf.orders", null, null, formatResponse);
    }
  }

  placeMFOrder(params) {
    return _post("mf.order.place", params);
  }

  cancelMFOrder(order_id) {
    return _delete("mf.order.cancel", { order_id: order_id });
  }

  getMFSIPS(sip_id) {
    if (sip_id) {
      return _get("mf.sip.info", { sip_id: sip_id }, null, formatResponse);
    } else {
      return _get("mf.sips", null, null, formatResponse);
    }
  }

  placeMFSIP(params) {
    return _post("mf.sip.place", params);
  }

  modifyMFSIP(sip_id, params) {
    params.sip_id = sip_id;
    return _put("mf.sip.modify", params);
  }

  cancelMFSIP(sip_id) {
    return _delete("mf.sip.cancel", { sip_id: sip_id });
  }

  getMFHoldings() {
    return _get("mf.holdings");
  }

  getMFInstruments = function () {
    return _get("mf.instruments", null, null, transformMFInstrumentsResponse);
  };

  // End of Mutual

  //  # GTT

  getGTTs() {
    return _get("gtt.triggers", null, null, formatResponse);
  }

  getGTT(trigger_id) {
    return _get(
      "gtt.trigger_info",
      { trigger_id: trigger_id },
      null,
      formatResponse
    );
  }

  getGTTPayload(params) {
    if (
      params.trigger_type !== self.GTT_TYPE_OCO &&
      params.trigger_type !== self.GTT_TYPE_SINGLE
    ) {
      throw new Error("Invalid `params.trigger_type`");
    }
    if (
      params.trigger_type === self.GTT_TYPE_OCO &&
      params.trigger_values.length !== 2
    ) {
      throw new Error("Invalid `trigger_values` for `OCO` order type");
    }
    if (
      params.trigger_type === self.GTT_TYPE_SINGLE &&
      params.trigger_values.length !== 1
    ) {
      throw new Error("Invalid `trigger_values` for `single` order type");
    }
    let condition = {
      exchange: params.exchange,
      tradingsymbol: params.tradingsymbol,
      trigger_values: params.trigger_values,
      last_price: parseFloat(params.last_price),
    };
    let orders = [];
    for (let o of params.orders) {
      orders.push({
        transaction_type: o.transaction_type,
        order_type: o.order_type,
        product: o.product,
        quantity: parseInt(o.quantity),
        price: parseFloat(o.price),
        exchange: params.exchange,
        tradingsymbol: params.tradingsymbol,
      });
    }
    return { condition, orders };
  }

  placeGTT(params) {
    let payload = self._getGTTPayload(params);
    return _post("gtt.place", {
      condition: JSON.stringify(payload.condition),
      orders: JSON.stringify(payload.orders),
      type: params.trigger_type,
    });
  }

  modifyGTT(trigger_id, params) {
    let payload = self._getGTTPayload(params);
    return _put("gtt.modify", {
      trigger_id: trigger_id,
      type: params.trigger_type,
      condition: JSON.stringify(payload.condition),
      orders: JSON.stringify(payload.orders),
    });
  }

  deleteGTT(trigger_id) {
    return _delete("gtt.delete", { trigger_id: trigger_id }, null, null);
  }

  // End of GGT

  getHoldings() {
    return this._get("portfolio.holdings");
  }

  getLoginURL() {
    return this.default_login_uri + "?api_key=" + this.api_key + "&v=3";
  }

  async generateSession(request_token, api_secret) {

    return new Promise(async function (resolve, reject) {
      var checksum = sha256(
         this.api_key + request_token + api_secret
      ).toString();

      var p = await this._post(
        "api.token",
        {
          api_key: this.api_key,
          request_token: request_token,
          checksum: checksum,
        },
        null,
        this.formatGenerateSession
      ).toPromise();

      p.then(function (resp) {
        // Set access token.
        if (resp && resp.access_token) {
          this.setAccessToken(resp.access_token);
        }
        return resolve(resp.access_token);
      }).catch(function (err) {
        return reject(err);
      });
    });
  }

  invalidateAccessToken(access_token) {
    access_token = access_token || this.access_token;
    return _delete("api.token.invalidate", {
      api_key: this.api_key,
      access_token: access_token,
    });
  }

  renewAccessToken(refresh_token, api_secret) {
    return new Promise(function (resolve, reject) {
      var checksum = sha256(
        this.api_key + refresh_token + api_secret
      ).toString();
      var p = this._post("api.token.renew", {
        api_key: this.api_key,
        refresh_token: refresh_token,
        checksum: checksum,
      });
      p.then(function (resp) {
        if (resp && resp.access_token) {
          this.setAccessToken(resp.access_token);
        }
        return resolve(resp);
      }).catch(function (err) {
        return reject(err);
      });
    });
  }

  invalidateRefreshToken(refresh_token) {
    return _delete("api.token.invalidate", {
      api_key: this.api_key,
      refresh_token: refresh_token,
    });
  }

  getOrderHistory(order_id) {
    return this._get(
      "order.info",
      { order_id: order_id },
      null,
      this.formatResponse
    );
  }

  getTrades() {
    return this._get("trades", null, null, this.formatResponse);
  }

  getOrderTrades(order_id) {
    return this._get(
      "order.trades",
      { order_id: order_id },
      null,
      this.formatResponse
    );
  }

  orderMargins(orders, mode = null) {
    return this._post("order.margins", orders, null, null, true, {
      mode: mode,
    });
  }

  placeOrder(variety, params) {
    params.variety = variety;
    return _post("order.place", params);
  }

  orderBasketMargins(orders, consider_positions = true, mode = null) {
    return this._post("order.margins.basket", orders, null, null, true, {
      consider_positions: consider_positions,
      mode: mode,
    });
  }

  getPositions() {
    return this._get("portfolio.positions");
  }

  getOrders() {
    return this._get("orders", null, null, this.formatResponse);
  }

  getLTP(instrument) {
    return this._get("market.quote.ltp", { i: instrument["i"].split(",") });
  }

  getOHLC(instrument) {
    return this._get("market.quote.ohlc", { i: instrument });
  }

  exitOrder(variety, order_id, params) {
    return this.cancelOrder(variety, order_id, params);
  }

  cancelOrder(variety, order_id, params) {
    params = params || {};
    params.variety = variety;
    params.order_id = order_id;
    return _delete("order.cancel", params);
  }

  convertPosition(params) {
    return this._put("portfolio.positions.convert", params);
  }

  getHistoricalData(
    instrument_token,
    interval,
    from_date,
    to_date,
    continuous,
    oi
  ) {
    continuous = continuous ? 1 : 0;
    oi = oi ? 1 : 0;
    if (typeof to_date === "object") to_date = this._getDateTimeString(to_date);
    if (typeof from_date === "object")
      from_date = this._getDateTimeString(from_date);
    return this._get(
      "market.historical",
      {
        instrument_token: instrument_token,
        interval: interval,
        from: from_date,
        to: to_date,
        continuous: continuous,
        oi: oi,
      },
      null,
      this.parseHistorical
    );
  }
  // Convert Date object to string of format yyyy-mm-dd HH:MM:SS
  _getDateTimeString(date) {
    var isoString = date.toISOString();
    return isoString.replace(" ", "+");
  }

  parseHistorical(jsonData) {
    // Return if its an error
    if (jsonData.error_type) return jsonData;
    var results = [];
    for (var i = 0; i < jsonData.data.candles.length; i++) {
      var d = jsonData.data.candles[i];
      var c = {
        date: new Date(d[0]),
        open: d[1],
        high: d[2],
        low: d[3],
        close: d[4],
        volume: d[5],
      };
      // Add OI field if its returned
      if (d[6]) {
        c["oi"] = d[6];
      }
      results.push(c);
    }
    return { data: results };
  }

  getInstruments(exchange) {
    if (exchange) {
      return this._get(
        "market.instruments",
        {
          exchange: exchange,
        },
        null,
        this.transformInstrumentsResponse
      );
    } else {
      return this._get(
        "market.instruments.all",
        null,
        null,
        this.transformInstrumentsResponse
      );
    }
  };
  getQuote = function(instruments) {
    return _get("market.quote", {"i": instruments}, null, formatQuoteResponse);
  };

  transformInstrumentsResponse(data, headers) {
    // Parse CSV responses
    if (headers["content-type"] === "text/csv") {
      var parsedData = csvParse.parse(data, { header: true }).data;
      for (var item of parsedData) {
        item["last_price"] = parseFloat(item["last_price"]);
        item["strike"] = parseFloat(item["strike"]);
        item["tick_size"] = parseFloat(item["tick_size"]);
        item["lot_size"] = parseInt(item["lot_size"]);
        if (item["expiry"] && item["expiry"].length === 10) {
          item["expiry"] = new Date(item["expiry"]);
        }
      }
      return parsedData;
    }
    return data;
  }

  // Format response ex. datetime string to date
  formatResponse(data) {
    if (!data.data || typeof data.data !== "object") return data;
    var list = [];
    if (data.data instanceof Array) {
      list = data.data;
    } else {
      list = [data.data];
    }
    var results = [];
    var fields = [
      "order_timestamp",
      "exchange_timestamp",
      "created",
      "last_instalment",
      "fill_timestamp",
    ];
    for (var item of list) {
      for (var field of fields) {
        if (item[field] && item[field].length === 19) {
          item[field] = new Date(item[field]);
        }
      }
      results.push(item);
    }
    if (data.data instanceof Array) {
      data.data = results;
    } else {
      data.data = results[0];
    }
    return data;
  }

  _get(route, params, responseType, responseTransformer, isJSON = false) {
    return this.request(
      route,
      "GET",
      params || {},
      responseType,
      responseTransformer,
      isJSON
    );
  }

  _post(
    route,
    params,
    responseType,
    responseTransformer,
    isJSON = false,
    queryParams = null
  ) {
    return this.request(
      route,
      "POST",
      params || {},
      responseType,
      responseTransformer,
      isJSON,
      queryParams
    );
  }

  _put(
    route,
    params,
    responseType,
    responseTransformer,
    isJSON = false,
    queryParams = null
  ) {
    return this.request(
      route,
      "PUT",
      params || {},
      responseType,
      responseTransformer,
      isJSON,
      queryParams
    );
  }

  _delete(route, params, responseType, responseTransformer, isJSON = false) {
    return this.request(
      route,
      "DELETE",
      params || {},
      responseType,
      responseTransformer,
      isJSON
    );
  }

  async request(
    route,
    method,
    params,
    responseType,
    responseTransformer,
    isJSON,
    queryParams
  ) {
    // Check access token
    if (!responseType) {
      responseType = "json";
    }
    var uri = this.routes[route];
    // Replace variables in "RESTful" URLs with corresponding params
    if (uri.indexOf("{") !== -1) {
      var k;
      for (k in params) {
        if (params.hasOwnProperty(k)) {
          uri = uri.replace("{" + k + "}", params[k]);
        }
      }
    }
    let payload = null;
    if (method === "GET" || method === "DELETE") {
      queryParams = params;
    } else {
      if (isJSON) {
        // post JSON payload
        payload = JSON.stringify(params);
      } else {
        // post url encoded payload
        // var param = new URLSearchParams(params);
        // payload = param.toString();
        payload = querystring.stringify(params);
      }
    }

    var options = {
      method: method,
      url: uri,
      params: queryParams,
      data: payload,
      // Set auth header
      headers: {},
    };
    // Send auth token
    if (this.access_token) {
      var authHeader = this.api_key + ":" + this.access_token;
      options["headers"]["Authorization"] = "token " + authHeader;
    }
    // Set request header content type
    if (isJSON) {
      options["headers"]["Content-Type"] = "application/json";
    } else {
      options["headers"]["Content-Type"] = "application/x-www-form-urlencoded";
    }
    // Set response transformer
    if (responseTransformer) {
      options.transformResponse =
        axios.defaults.transformResponse.concat(responseTransformer);
    }

    var requestInstance = axios.create({
      baseURL: this.root,
      timeout: this.timeout,
      headers: {
        "X-Kite-Version": this.kiteVersion,
        // "User-Agent": userAgent
      },
      paramsSerializer: function (params) {
        // var s = [];
        // Object.entries(params)
        //   .map((i) => {
        //       var key = i[0];
        //       var value = i[1];
        //         for (var p in value) {
        //             s.push([ key, encodeURIComponent(value[p])].join("="))
        //         }
        //   })
        // var t = s.join('&');
        // return t;
        return querystring.stringify(params);
      },
    });
    // Add a request interceptor
    requestInstance.interceptors.request.use(function (request) {
      // if (this.debug) console.log(request);
      return request;
    });
    // Add a response interceptor
    requestInstance.interceptors.response.use(
      function (response) {
        // if (this.debug) console.log(response);
        var contentType = response.headers["content-type"];
        if (
          contentType === "application/json" &&
          typeof response.data === "object"
        ) {
          // Throw incase of error
          if (response.data.error_type) throw response.data;
          // Return success data
          return response.data.data;
        } else if (contentType === "text/csv") {
          // Return the response directly
          return response.data;
        } else {
          return {
            error_type: "DataException",
            message:
              "Unknown content type (" +
              contentType +
              ") with response: (" +
              response.data +
              ")",
          };
        }
      },
      function (error) {
        let resp = {
          message: "Unknown error",
          error_type: "GeneralException",
          data: null,
        };
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.data && error.response.data.error_type) {
            if (
              error.response.data.error_type === "TokenException" &&
              this.session_expiry_hook
            ) {
              this.session_expiry_hook();
            }
            resp = error.response.data;
          } else {
            resp.error_type = "NetworkException";
            resp.message = error.response.statusText;
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          resp.error_type = "NetworkException";
          resp.message =
            "No response from server with error code: " + error.code;
        } else if (error.message) {
          resp = error;
        }
        return Promise.reject(resp);
      }
    );

    var requestInst = await requestInstance.request(options);
    return requestInst;
  }

  setSessionExpiryHook(cb) {
    this.session_expiry_hook = cb;
  }

  validatePostback(postback_data, api_secret) {
    if (
      !postback_data ||
      !postback_data.checksum ||
      !postback_data.order_id ||
      !postback_data.order_timestamp ||
      !api_secret
    ) {
      throw new Error("Invalid postback data or api_secret");
    }
    var inputString =
      postback_data.order_id + postback_data.order_timestamp + api_secret;
    var checksum;
    try {
      checksum = sha256(inputString).toString();
    } catch (e) {
      throw e;
    }
    if (postback_data.checksum === checksum) {
      return true;
    } else {
      return false;
    }
  }

  formatGenerateSession(data) {
    if (!data.data || typeof data.data !== "object") return data;
    if (data.data.login_time) {
      data.data.login_time = new Date(data.data.login_time);
    }
    return data;
  }

  formatQuoteResponse(data) {
    if (!data.data || typeof data.data !== "object") return data;
    for (var k in data.data) {
      var item = data.data[k];
      for (var field of ["timestamp", "last_trade_time"]) {
        if (item[field] && item[field].length === 19) {
          item[field] = new Date(item[field]);
        }
      }
    }
    return data;
  }
}

module.exports = KiteConnect;
