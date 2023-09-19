DROP TABLE IF EXISTS votes;

CREATE TABLE 'votes' (
  'id' INTEGER PRIMARY KEY,
  'kind' VARCHAR(8) DEFAULT NULL,
  'target' VARCHAR(8) DEFAULT NULL,
  'query' TEXT,
  'vote' VARCHAR(4) DEFAULT NULL,
  'top_k' INTEGER,
  'weight_results' INTEGER,
  'n' INTEGER,
  'm' INTEGER,
  'since_year' INTEGER,
  'distance_threshold' REAL,
  'pow' REAL,
  'with_plot' INTEGER,
  'created_at' TIMESTAMP DATETIME DEFAULT CURRENT_TIMESTAMP
);