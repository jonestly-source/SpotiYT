import react from "react";
import { Hide, Share, Clear, Remove } from "../assets/Icons";
import { toJS } from "mobx";

export default function Queries(props) {
  const data = props.query ? toJS(props.query) : null;

  const clearHandle = (e) => {
    e.stopPropagation();
    props.store.removeQueries();
  };

  const removeQueue = (index) => {
  	props.store.removeQueue = index
  };

  return (
    <div className="query" style={{ overflowY: "auto" }}>
      <div className="top">
        <button className="icon">
          <Hide onClick={props.onClick} />
        </button>
        <div
          className="info"
          style={{ textAlign: "center", marginInline: "auto" }}
        >
          <div className="secondary">Now Playing</div>
          <div className="title">{props.playing}</div>
        </div>
        <Share onClick={props.shareHandler} />
      </div>
      <div
        style={{
          marginInline: "20px",
          fontSize: "12px",
          fontStyle: "italic",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="secondary">Next in Queue</div>
        <button className="icon">
          <Clear onClick={clearHandle} className="secondary" />
        </button>
      </div>
      {data?.map((item, i) => (
        <div className="container" key={i} style={{ padding: "20px" }}>
          <div
            className="icon"
            style={{ height: "100%", stroke: "var(--mute-color)" }}
            onClick={(e) => {
              e.stopPropagation();
              removeQueue(i);
            }}
          >
            <Remove />
          </div>
          <div className="info" style={{ maxWidth: "90%" }}>
            <div className="title">{item.track.name}</div>
            <div className="artist">{item.track.artists[0].name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
