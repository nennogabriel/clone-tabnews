import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <div className="container">
      <h1>Status</h1>
      <UpdatedAt />
      <ShowStatusData />
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  let updatedText = "Carregando...";
  if (!isLoading && data) {
    updatedText = new Date(data.updated_at).toLocaleString("pt-BR");
  }
  return <div className="updatedAt">ultima atualização: {updatedText}</div>;
}

function ShowStatusData() {
  const { data, isLoading } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  if (isLoading || !data) {
    return <div>Carregando...</div>;
  }

  // strip off unused data from the response
  delete data.updated_at;

  return (
    <>
      <ShowObject object={data} />
    </>
  );
}

function formatKey(key) {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function ShowTitleByLevel({ level, title }) {
  switch (level) {
    case 1:
      return <h1>{title}</h1>;
    case 2:
      return <h2>{title}</h2>;
    case 3:
      return <h3>{title}</h3>;
    case 4:
      return <h4>{title}</h4>;
    case 5:
      return <h5>{title}</h5>;
    default:
      return <h6>{title}</h6>;
  }
}

function ShowObject({ object, prefix = "", level = 2 }) {
  return (
    <>
      {Object.entries(object).map(([k, v]) => {
        const formattedKey = formatKey(k);
        if (typeof v === "object") {
          return (
            <div key={prefix + k}>
              <ShowTitleByLevel
                level={level}
                title={formattedKey.toUpperCase()}
              />
              <details key={k} title={formattedKey} open>
                <ShowObject
                  object={v}
                  prefix={prefix + k}
                  level={Math.min(level + 1, 6)}
                />
              </details>
            </div>
          );
        }
        return (
          <div key={k} className="info">
            {formattedKey}: {v}
          </div>
        );
      })}
    </>
  );
}
