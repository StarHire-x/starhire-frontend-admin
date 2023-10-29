"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getOneForumCategory,
  updateForumCategory,
  updateForumPost,
} from "@/app/api/forum/route";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabMenu } from "primereact/tabmenu";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { DialogBox } from "@/components/DialogBox/DialogBox";
import { ForumPostDetail } from "../components/ForumPostDetail/ForumPostDetail";
import GuidelinesDisplay from "@/components/GuidelinesForm/GuidelinesForm";
import { Toast } from "primereact/toast";

export const formatDate = (value) => {
  return value?.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const getSeverity = (status) => {
  switch (status) {
    case "Reported":
      return "danger";

    case "Active":
      return "success";

    case "Pending":
      return "warning";

    case "Inactive":
      return "primary";

    case "Deleted":
      return "null";
  }
};
const CategoryPage = () => {
  const session = useSession();
  const router = useRouter();
  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;
  const params = useSearchParams();
  const categoryId = params.get("id");
  const tabs = [
    { label: "All Posts", icon: "", index: 0 },
    { label: "Pending", icon: "", index: 1 },
    { label: "Reported", icon: "", index: 2 },
  ];

  const toast = useRef(null);
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [forumPosts, setForumPosts] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isGuidelinesDialog, setIsGuidelinesDialog] = useState(false);
  const [isActiveArchiveCategory, setIsActiveArchiveCategory] = useState(false);

  const initialiseCategory = async () => {
    try {
      setIsLoading(true);
      const forumCategory = await getOneForumCategory(categoryId, accessToken);
      setCategory(forumCategory);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const updateForumPostStatus = async (forumPostId, updatedStatus) => {
    try {
      setIsLoading(true);
      const request = {
        forumPostStatus: updatedStatus,
      };
      await updateForumPost(request, forumPostId, accessToken);
      await initialiseCategory();
      setIsLoading(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Successfully updated forum post status!",
        life: 5000,
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update forum post status.",
        life: 5000,
      });
    }
  };

  const updateCategoryStatus = async (toArchiveCategory, categoryId) => {
    try {
      setIsLoading(true);
      const request = {
        isArchived: toArchiveCategory,
      };
      await updateForumCategory(request, categoryId, accessToken);
      await initialiseCategory();
      setIsLoading(false);
      setIsActiveArchiveCategory(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Successfully updated forum category status!",
        life: 5000,
      });
    } catch (error) {
      console.log(error);
      setIsActiveArchiveCategory(false);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update forum category status!",
        life: 5000,
      });
    }
  };

  const dateCreatedColumn = (rowData) => {
    return formatDate(new Date(rowData?.createdAt));
  };

  const statusColumn = (rowData) => {
    return (
      <Tag
        value={rowData?.forumPostStatus}
        severity={getSeverity(rowData?.forumPostStatus)}
      />
    );
  };

  const buttonsColumn = (rowData) => {
    const status = rowData?.forumPostStatus;
    return (
      <div className={styles.actionButtons}>
        <Button
          rounded
          outlined
          severity="info"
          icon="pi pi-align-justify"
          onClick={() => setSelectedPost(rowData)}
          tooltip="View details"
          tooltipOptions={{ position: "top" }}
        />
        {status != "Inactive" &&
          status != "Deleted" && ( // inactive and deleted posts should not be "deleted"
            <Button
              icon="pi pi-times"
              rounded
              outlined
              severity="danger"
              aria-label="Cancel"
              onClick={() =>
                updateForumPostStatus(rowData?.forumPostId, "Inactive")
              }
              tooltip="Inactivate forum post"
              tooltipOptions={{ position: "top" }}
            />
          )}
        {(status === "Pending" ||
          status === "Inactive" ||
          status === "Reported") && ( // only pending and inactive can become "active" again
          <Button
            icon="pi pi-check"
            rounded
            outlined
            severity="success"
            onClick={() =>
              updateForumPostStatus(rowData?.forumPostId, "Active")
            }
            tooltip="Activate forum post"
            tooltipOptions={{ position: "top" }}
          />
        )}
      </div>
    );
  };

  const activeArchiveDialogButtons = (
    <div className="flex-container space-between">
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={() => setIsActiveArchiveCategory(false)}
        className="p-button-text"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        onClick={async () => {
          await updateCategoryStatus(
            category?.isArchived ? false : true,
            category?.forumCategoryId
          );
        }}
        loading={isLoading}
        autoFocus
      />
    </div>
  );

  useEffect(() => {
    // Initial load for categoryId
    initialiseCategory();
  }, [categoryId, accessToken]);

  useEffect(() => {
    if (category) {
      if (currentTab?.label === "All Posts") {
        setForumPosts([...category?.forumPosts]);
      } else if (currentTab?.label === "Pending") {
        setForumPosts([
          ...category?.forumPosts?.filter(
            (forumPost) => forumPost?.forumPostStatus === "Pending"
          ),
        ]);
      } else {
        setForumPosts([
          ...category?.forumPosts?.filter(
            (forumPost) => forumPost?.forumPostStatus === "Reported"
          ),
        ]);
      }
    }
    if (searchId != "") {
      setForumPosts([
        ...category?.forumPosts?.filter((forumPost) => {
          return forumPost?.forumPostId.toString().includes(searchId);
        }),
      ]);
    }
  }, [currentTab, category, searchId]);

  return (
    <div>
      <Toast ref={toast} />
      {isLoading && <ProgressSpinner />}
      {isGuidelinesDialog && (
        <DialogBox
          header={`Guidelines for ${category?.forumCategoryTitle}`}
          isOpen={isGuidelinesDialog}
          setVisible={setIsGuidelinesDialog}
        >
          <GuidelinesDisplay
            category={category}
            accessToken={accessToken}
            closeDialog={(success) => {
              if (success) {
                initialiseCategory();
                toast.current.show({
                  severity: "success",
                  summary: "Success",
                  detail: "Successfully updated forum guidelines!",
                  life: 5000,
                });
              } else {
                toast.current.show({
                  severity: "error",
                  summary: "Error",
                  detail: "Failed to update forum guidelines!",
                  life: 5000,
                });
              }

              setIsGuidelinesDialog(false);
            }}
          />
        </DialogBox>
      )}
      {isActiveArchiveCategory && (
        <DialogBox
          header={
            category?.isArchived ? "Re-activate category?" : "Archive category?"
          }
          content={`Are you sure you would like to ${
            category?.isArchived ? "re-activate" : "archive"
          } this forum category?`}
          footerContent={activeArchiveDialogButtons}
          isOpen={isActiveArchiveCategory}
          setVisible={setIsActiveArchiveCategory}
        />
      )}
      {selectedPost != null && (
        <DialogBox
          header={`Post Details`}
          isOpen={selectedPost != null}
          setVisible={() => setSelectedPost(null)}
          className={styles.modal}
        >
          <div className={styles.modal}>
            <ForumPostDetail
              forumPost={selectedPost}
              forumComments={selectedPost?.forumComments}
            />
          </div>
        </DialogBox>
      )}
      {!isLoading && (
        <div className={styles.content}>
          <div className={styles.heading}>
            <div className={styles.categoryName}>
              <h2>{category?.forumCategoryTitle} Details</h2>
              <Button
                className={styles.statusButton}
                label={category?.isArchived ? "Archived" : "Active"}
                severity={category?.isArchived ? "secondary" : "success"}
                onClick={() => setIsActiveArchiveCategory(true)}
                tooltip="Update category status"
                tooltipOptions={{ position: "top" }}
              />
            </div>

            <Button
              severity="info"
              label={"Guidelines"}
              onClick={() => setIsGuidelinesDialog(true)}
            />
          </div>

          <Card className={styles.card}>
            <div className={styles.container}>
              <div className={styles.tableHeader}>
                <TabMenu
                  className={styles.tabMenu}
                  model={tabs}
                  onTabChange={(e) => setCurrentTab(e.value)}
                  activeIndex={currentTab?.index}
                />
                <span className="p-input-icon-left">
                  <i className="pi pi-search" />
                  <InputText
                    className={styles.input}
                    placeholder="Search Post ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                  />
                </span>
              </div>

              {forumPosts.length === 0 && (
                <h2 className={styles.text}>No posts available.</h2>
              )}
              {forumPosts.length > 0 && (
                <DataTable
                  className={styles.dataTable}
                  value={forumPosts}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  tableStyle={{ minWidth: "50rem" }}
                  scrollable
                  removableSort
                  scrollHeight="45vh"
                  globalFilterFields={["status"]}
                >
                  <Column
                    field="forumPostId"
                    header="Post ID"
                    style={{ width: "10%" }}
                    sortable
                  />
                  <Column
                    field="forumPostTitle"
                    header="Title"
                    style={{ width: "55%" }}
                    sortable
                  />
                  <Column
                    field="createdAt"
                    header="Date Created"
                    style={{ width: "15%" }}
                    sortable
                    body={dateCreatedColumn}
                  />
                  <Column
                    field="forumPostStatus"
                    header="Status"
                    style={{ width: "5%" }}
                    sortable
                    body={statusColumn}
                  />
                  <Column
                    field="buttons"
                    header=""
                    style={{ width: "25%" }}
                    body={buttonsColumn}
                  />
                </DataTable>
              )}
            </div>
          </Card>
          <Button
            label="Back"
            className={styles.backButton}
            icon="pi pi-chevron-left"
            rounded
            severity="info"
            onClick={() => router.push("/forum")}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
