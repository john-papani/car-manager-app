import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CostDonutChart from "@/components/CostDonutChart";

describe("CostDonutChart", () => {
  it("draws a full circle when one category is 100% of the cost", () => {
    const html = renderToStaticMarkup(
      createElement(CostDonutChart, {
        total: 50,
        segments: [{ label: "Καύσιμα", value: 50, color: "#ca6f3d" }],
      }),
    );

    expect(html).toContain('<circle cx="60" cy="60" r="42"');
    expect(html).toContain('stroke="#ca6f3d"');
    expect(html).toContain("Καύσιμα");
  });
});
