import React from "react";

const { createRootMock, renderMock } = vi.hoisted(() => ({
  renderMock: vi.fn(),
  createRootMock: vi.fn(() => ({
    render: renderMock,
  })),
}));

vi.mock("react-dom/client", () => ({
  createRoot: createRootMock,
}));

vi.mock("./App.jsx", () => ({
  default: function AppMock() {
    return null;
  },
}));

global.React = React;

describe("main", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("monta la aplicacion en el elemento root", async () => {
    const rootElement = document.getElementById("root");

    await import("./main.jsx");

    expect(createRootMock).toHaveBeenCalledWith(rootElement);
    expect(renderMock).toHaveBeenCalledTimes(1);
  });
});
