import styles from "./ForumPostComments.module.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useEffect, useState } from "react";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { formatTimestamp } from "@/common/helper/helper";

export const ForumPostComments = ({ forumComments }) => {
  const [comments, setComments] = useState(forumComments);
  const [searchId, setSearchId] = useState("");

  const dateTimeColumn = (rowData) => {
    return formatTimestamp(rowData?.createdAt);
  };

  const usernameColumn = (rowData) => {
    return rowData?.jobSeeker?.userName;
  };

  const anonymousColumn = (rowData) => {
    return rowData?.isAnonymous ? (
      <Tag value="Anonymous" severity="info" />
    ) : (
      <></>
    );
  };

  useEffect(() => {
    if (searchId != "") {
      setComments([
        ...forumComments?.filter((comment) => {
          return comment?.forumCommentId?.toString().includes(searchId);
        }),
      ]);
    } else {
      setComments(forumComments);
    }
  }, [forumComments, searchId]);

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            className={styles.input}
            placeholder="Search ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </span>
      </div>

      <DataTable
        value={comments}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "55vw" }}
        removableSort
        scrollHeight="45vh"
        showGridlines
        scrollable
      >
        <Column
          field="forumCommentId"
          header="ID"
          sortable
          frozen
          style={{ width: "5%" }}
        />
        <Column
          field="forumCommentMessage"
          header="Comment"
          sortable
          frozen
          style={{ width: "30%" }}
        />
        <Column
          field="createdAt"
          header="Date & Time"
          sortable
          style={{ width: "15%" }}
          body={dateTimeColumn}
        />
        <Column
          field="jobSeeker"
          header="Username"
          sortable
          style={{ width: "10%" }}
          body={usernameColumn}
        />
        <Column
          field="isAnonymous"
          header="Anonymous?"
          sortable
          style={{ width: "5%" }}
          body={anonymousColumn}
        />
      </DataTable>
    </div>
  );
};
