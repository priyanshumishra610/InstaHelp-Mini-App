import { FLIPKART_WIDGET_SCRIPT } from "@/constants/shop";

type WidgetSpec = {
  wrid: string;
  widgetType: string;
  height: number;
  width: number;
};

export function buildFlipkartWidgetHtml(widget: WidgetSpec): string {
  const { wrid, widgetType, height, width } = widget;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: transparent;
      overflow: hidden;
      -webkit-overflow-scrolling: touch;
    }
    .host {
      width: 100%;
      min-height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 0;
    }
    .affiliateAdsByFlipkart {
      max-width: 100% !important;
      width: 100% !important;
    }
  </style>
</head>
<body>
  <div class="host">
    <div
      data-WRID="${wrid}"
      data-widgetType="${widgetType}"
      data-class="affiliateAdsByFlipkart"
      height="${height}"
      width="${width}"
    ></div>
  </div>
  <script async src="${FLIPKART_WIDGET_SCRIPT}"></script>
</body>
</html>`;
}
