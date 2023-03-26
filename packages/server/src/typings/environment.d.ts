interface ImportMeta {
  env: {
    PORT?: string;
    LOG_FORMAT?: 'json';
    VERSION?: string;
    NAME?: string;
    NODE_ENV: 'development' | 'production';
    HTTPS_HSTS?: string;
    PROXY?: 'true';
    HTTPS_PROXY?: string;
    LOG_LEVEL?: string;
  };
}
