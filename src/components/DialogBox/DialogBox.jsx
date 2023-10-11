import { Dialog } from "primereact/dialog";
import styles from "./dialogBox.module.css";

export const DialogBox = ({
  header,
  content,
  footerContent,
  isOpen,
  setVisible,
  children,
}) => {
  return (
    <Dialog
      header={header}
      visible={isOpen}
      style={{ width: "50vw" }}
      onHide={() => setVisible(false)}
      footer={footerContent}
    >
      <p className="m-0">{content}</p>
      {children}
    </Dialog>
  );
};
