import { Dialog } from "primereact/dialog";

export const DialogBox = ({
  header,
  content,
  footerContent,
  isOpen,
  setVisible,
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
    </Dialog>
  );
};