import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Adog pet care prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>爱多格宠物健康管家<\/title>/i);
  assert.match(html, /宠物健康管家/);
  assert.match(html, /阿布/);
  assert.match(html, /汤圆/);
  assert.match(html, /预约服务/);
  assert.match(html, /狂犬疫苗加强针/);
  assert.match(html, /宠物档案/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|react-loading-skeleton/i);
});

test("keeps the prototype accessible as a single responsive surface", async () => {
  const html = await (await render()).text();
  assert.match(html, /aria-label="主导航"/);
  assert.match(html, /aria-label="选择宠物"/);
  assert.match(html, /aria-label="打开消息"/);
  assert.match(pageSource, /aria-current=/, "active bottom navigation should expose its current page");
});

test("defines the pet health summary and lifecycle record vocabulary", () => {
  // The health and timeline panels are opened client-side, so their labels are
  // verified against the compiled page contract in addition to the SSR smoke
  // checks above.
  for (const label of ["健康摘要", "疫苗", "驱虫", "用药", "过敏", "体重", "异常记录"]) {
    assert.match(pageSource, new RegExp(label), `missing pet health field: ${label}`);
  }
  assert.match(pageSource, /基础信息/);
  assert.match(pageSource, /家庭协作/);
});

test("exposes complete medical and grooming booking details", () => {
  for (const label of ["门店", "医生", "美容师", "价格", "时长", "会员权益"]) {
    assert.match(pageSource, new RegExp(label), `missing booking detail: ${label}`);
  }
  assert.match(pageSource, /(修改预约|修改)/, "booking should offer a reschedule action");
  assert.match(pageSource, /(取消预约|取消)/, "booking should offer a cancellation action");
});

test("connects the self-operated shop to cart, orders, and repeat care", () => {
  assert.match(pageSource, /(购物车|购物袋)/, "shop needs a cart entry point");
  assert.match(pageSource, /订单/, "shop needs an order entry point");
  assert.match(pageSource, /(到店自提|配送)/, "shop needs fulfilment options");
  assert.match(pageSource, /(复购|补货|提醒)/, "shop should expose a repeat-purchase reminder");
});

test("provides a safe, accessible assistant handoff flow", () => {
  assert.match(pageSource, /<(?:input|textarea)\b[^>]*(?:placeholder|aria-label)=/i, "assistant needs a text input");
  assert.match(pageSource, /(上传照片|添加照片|拍照)/, "assistant needs a photo attachment affordance");
  assert.match(pageSource, /(转人工|人工客服|联系人工)/, "assistant needs a human handoff");
  assert.match(pageSource, /急症/, "assistant needs an emergency warning");
  assert.match(pageSource, /(诊断|用药)/, "assistant needs the diagnosis/medication safety boundary");
});

test("supports a welcoming entry animation and editable pet records", () => {
  assert.match(pageSource, /进入爱多格/, "welcome screen needs a clear entry action");
  assert.match(pageSource, /让每一只宠物更健康/, "welcome screen needs the brand promise");
  assert.match(pageSource, /添加宠物/, "pet switcher needs a new-pet entry point");
  assert.match(pageSource, /编辑宠物档案/, "pet records need an edit entry point");
  assert.match(pageSource, /在线咨询/, "assistant card needs an explicit consultation label");
});
