import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ResponsiveDataCell, ResponsiveDataList } from "./responsive-data-list";

afterEach(() => {
  cleanup();
});

const sampleRows = [
  { id: "1", name: "Alpha", value: "100" },
  { id: "2", name: "Beta", value: "200" }
];

describe("ResponsiveDataList", () => {
  it("renders mobile cards and desktop table regions", () => {
    const { container } = render(
      <ResponsiveDataList
        rows={sampleRows}
        getRowKey={(row) => row.id}
        columns={[
          { id: "name", label: "Name" },
          { id: "value", label: "Value" }
        ]}
        renderCard={(row) => (
          <div>
            <p>{row.name}</p>
            <p>{row.value}</p>
          </div>
        )}
        renderRow={(row) => (
          <>
            <ResponsiveDataCell>{row.name}</ResponsiveDataCell>
            <ResponsiveDataCell>{row.value}</ResponsiveDataCell>
          </>
        )}
      />
    );

    expect(screen.getAllByText("Alpha").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Beta").length).toBeGreaterThan(0);
    expect(container.querySelector('[class*="md:hidden"]')).toBeTruthy();
    expect(container.querySelector('[class*="hidden"][class*="md:block"]')).toBeTruthy();
    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("shows loading skeleton regions", () => {
    const { container } = render(
      <ResponsiveDataList
        loading
        loadingSkeleton={{
          mobile: <div data-testid="mobile-skeleton">loading mobile</div>,
          desktop: <div data-testid="desktop-skeleton">loading desktop</div>
        }}
      />
    );

    expect(screen.getByTestId("mobile-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("desktop-skeleton")).toBeInTheDocument();
    expect(container.querySelector("table")).not.toBeInTheDocument();
  });

  it("renders empty state when there are no rows", () => {
    render(
      <ResponsiveDataList
        rows={[]}
        emptyState={<p>No items found</p>}
        columns={[{ id: "name", label: "Name" }]}
        renderCard={() => null}
        renderRow={() => null}
      />
    );

    expect(screen.getByText("No items found")).toBeInTheDocument();
  });
});
