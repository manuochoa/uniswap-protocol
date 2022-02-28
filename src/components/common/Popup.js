import { useRef } from "react";
import { getScrollbarWidth } from "./../../services/scrollbarService";

export default function Popup({
  popupShow,
  setPopupShow,
  children,
  className,
}) {
  const popup = useRef(null);

  if (popupShow) {
    document.body.style.paddingRight = getScrollbarWidth() + "px";
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.paddingRight = null;
    document.body.style.overflow = null;
  }

  function closePopup(e) {
    if (e.nativeEvent.target === popup.current) {
      setPopupShow(false);
    }
  }

  return (
    <div
      className={"popup " + (className || "") + (popupShow ? " opened" : "")}
      ref={popup}
      onClick={closePopup}
    >
      <div className="popup__wrapper">{children}</div>
    </div>
  );
}
