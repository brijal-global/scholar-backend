import db from "../../lib/sequelize.js";
import { generateModelJSON } from "../../utils/erdGenerator.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

export const getJSONERD = async (req, res, next) => {
  try {
    const jsonData = generateModelJSON(db);
    return res.status(200).json({
      status: 200,
      message: "Database models JSON representation",
      data: jsonData,
      source: "/erd/json [GET]",
    });
  } catch (error) {
    next(error);
  }
};

export const getSequelizeERD = async (req, res, next) => {
  try {
    const generateERD = require("sequelize-erd");

    const format = req.query.format || "svg";
    const engine = req.query.engine || "neato"; // neato, dot, circo, fdp, twopi

    const erdOptions = {
      source: db.sequelize,
      format: format,
      engine: engine,
      color: "blue3",
      arrowShapes: {
        BelongsToMany: ["crow", "crow"],
        BelongsTo: ["crow", "none"],
        HasMany: ["none", "crow"],
        HasOne: ["none", "none"],
      },
      arrowSize: 0.6,
      lineWidth: 1,
      columns: true,
    };

    const erd = await generateERD(erdOptions);

    if (format === "svg") {
      const html = getSequelizeHTML(engine, erd);
      res.send(html);
    } else if (format === "dot") {
      res.set("Content-Type", "text/plain");
      res.send(erd);
    } else if (format === "png") {
      res.set("Content-Type", "image/png");
      res.send(erd);
    } else {
      res.set("Content-Type", "image/svg+xml");
      res.send(erd);
    }
  } catch (error) {
    next(error);
  }
};

const getSequelizeHTML = (engine, erd) => {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database ERD - Scholar</title>
    <style>
      body {
        margin: 0;
        padding: 10px 8px;
        background: linear-gradient(135deg, #1e3a8a 0%, #000000 100%);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .container {
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        padding: 30px;
        max-width: 95%;
        overflow-x: auto;
      }
      h1 {
        color: #333;
        margin-bottom: 10px;
        text-align: center;
      }
      .subtitle {
        text-align: center;
        color: #666;
        margin-bottom: 20px;
      }
      .controls {
        text-align: center;
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        background: #6B7280;
        color: white;
        text-decoration: none;
        display: inline-block;
      }
      .btn:hover {
        background: #4B5563;
      }
      .btn-secondary {
        background: #6B7280;
      }
      .btn-secondary:hover {
        background: #4B5563;
      }
      .btn-small {
        padding: 8px 16px;
        font-size: 13px;
      }
      .btn-active {
        background: #1e3a8a;
      }
      .btn-active:hover {
        background: #1e40af;
      }
      .engine-selector {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .engine-label {
        font-weight: 600;
        color: #333;
        margin-right: 5px;
      }
      svg {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 20px auto;
      }
      @media print {
        body {
          background: white;
          padding: 0;
        }
        .container {
          box-shadow: none;
          padding: 0;
          max-width: 100%;
        }
        h1, .subtitle, .controls {
          display: none;
        }
        svg {
          margin: 0;
          max-width: 100%;
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Database Design - ERD</h1>
      <p class="subtitle">Scholar Backend - Layout Engine: ${engine}</p>
      <div class="controls">
        <div class="engine-selector">
          <span class="engine-label">Layout Engine:</span>
          <a href="/api/erd?engine=neato" class="btn btn-small ${engine === "neato" ? "btn-active" : ""}">NEATO</a>
          <a href="/api/erd?engine=dot" class="btn btn-small ${engine === "dot" ? "btn-active" : ""}">DOT</a>
          <a href="/api/erd?engine=circo" class="btn btn-small ${engine === "circo" ? "btn-active" : ""}">CIRCO</a>
          <a href="/api/erd?engine=fdp" class="btn btn-small ${engine === "fdp" ? "btn-active" : ""}">FDP</a>
          <a href="/api/erd?engine=twopi" class="btn btn-small ${engine === "twopi" ? "btn-active" : ""}">TWOPI</a>
          <a href="/api/erd/json" class="btn btn-small">JSON</a>
        </div>
      </div>
      ${erd}
    </div>
  </body>
</html>`;

  return html;
};
