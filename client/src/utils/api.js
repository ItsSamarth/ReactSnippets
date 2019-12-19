import axios from "axios";

import CONFIG from "../config/config";

const INSTANCE = axios.create({
  baseURL: CONFIG.base_url,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true
});

export default INSTANCE;
