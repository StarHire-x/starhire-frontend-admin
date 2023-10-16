import styles from "./ForumPostDetail.module.css";
import { Fieldset } from "primereact/fieldset";
import { Tag } from "primereact/tag";
import { formatTimestamp } from "@/common/helper/helper";
import { getSeverity } from "@/app/forum/category/page";
import { Divider } from "primereact/divider";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { ForumPostComments } from "../ForumPostComments/ForumPostComments";

export const ForumPostDetail = ({ forumPost, forumComments }) => {
  const router = useRouter();
  const legendTag = (
    <div className={styles.legendTag}>
      <span className="font-bold text-lg">#{forumPost?.forumPostId} Post</span>
    </div>
  );
  const commentTag = (
    <div className={styles.legendTag}>
      <span className="font-bold text-lg">
        {forumPost?.forumComments?.length} Comments
      </span>
    </div>
  );
  return (
    <div className={styles.modal}>
      <Fieldset toggleable legend={legendTag}>
        <div className={styles.container}>
          <h2>{forumPost?.forumPostTitle}</h2>
          <div className={styles.tags}>
            <Tag
              severity={getSeverity(forumPost?.forumPostStatus)}
              value={forumPost?.forumPostStatus}
            />
            <Tag
              severity="info"
              value={forumPost?.isAnonymous ? "Anonymous" : "Non-anonymous"}
            />
          </div>

          <div className={styles.userDetails}>
            <span className="pi pi-user" />
            <Button
              label={forumPost?.jobSeeker?.userName}
              onClick={() => router.push("/userManagement")}
              text
              severity="secondary"
            />
          </div>
          <Divider type="solid" />
          <p className="m-0">{forumPost?.forumPostMessage}</p>
          <Tag
            className={styles.dateTag}
            value={formatTimestamp(forumPost?.createdAt)}
          />
        </div>
      </Fieldset>
      <Fieldset toggleable legend={commentTag}>
        <div className={styles.commentSection}>
          <ForumPostComments forumComments={forumComments} />
        </div>
      </Fieldset>
    </div>
  );
};
