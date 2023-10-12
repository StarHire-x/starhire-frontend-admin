"use client";
import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOneForumCategory, updateForumPost } from "@/app/api/forum/route";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabMenu } from "primereact/tabmenu";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

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
    { label: "Reviewing", icon: "", index: 1 },
  ];

  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [forumPosts, setForumPosts] = useState([]);

  const getSeverity = (status) => {
    switch (status) {
      case "Reported":
        return "danger";

      case "Active":
        return "success";

      case "Inactive":
        return "null";

      case "Pending":
        return "warning";
    }
  };

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
      initialiseCategory();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const formatDate = (value) => {
    return value.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
        <Button rounded outlined severity="info" icon="pi pi-align-justify" />
        {status != "Inactive" && (
          <Button
            icon="pi pi-times"
            rounded
            outlined
            severity="danger"
            aria-label="Cancel"
            onClick={() =>
              updateForumPostStatus(rowData?.forumPostId, "Inactive")
            }
          />
        )}
        {status === "Pending" && (
          <Button
            icon="pi pi-check"
            rounded
            outlined
            severity="success"
            onClick={() =>
              updateForumPostStatus(rowData?.forumPostId, "Active")
            }
          />
        )}
      </div>
    );
  };

  const rowButtons = (rowData) => {};

  useEffect(() => {
    // Initial load for categoryId
    initialiseCategory();
  }, [categoryId, accessToken]);

  useEffect(() => {
    if (category) {
      if (currentTab?.label === "All Posts") {
        setForumPosts([...category?.forumPosts]);
      } else {
        setForumPosts([
          ...category?.forumPosts?.filter(
            (forumPost) => forumPost?.forumPostStatus === "Pending"
          ),
        ]);
      }
    }
  }, [currentTab, category]);

  return (
    <div>
      {isLoading && <ProgressSpinner />}
      {!isLoading && (
        <div className={styles.content}>
          <div className={styles.heading}>
            <h2>{category?.forumCategoryTitle} Details</h2>
            <Button
              className={styles.backButton}
              icon="pi pi-arrow-left"
              rounded
              text
              severity="info"
              aria-label="Search"
              onClick={() => router.push("/forum")}
            />
          </div>

          <Card className={styles.card}>
            <div className={styles.container}>
              <TabMenu
                className={styles.tabMenu}
                model={tabs}
                onTabChange={(e) => setCurrentTab(e.value)}
                activeIndex={currentTab?.index}
              />
              {forumPosts.length > 0 && (
                <DataTable
                  className={styles.dataTable}
                  value={forumPosts}
                  paginator
                  rows={5}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  tableStyle={{ minWidth: "50rem" }}
                  scrollable
                  scrollHeight="45vh"
                >
                  <Column
                    field="forumPostId"
                    header="Post ID"
                    style={{ width: "10%" }}
                  />
                  <Column
                    field="forumPostTitle"
                    header="Title"
                    style={{ width: "55%" }}
                  />
                  <Column
                    field="createdAt"
                    header="Date Created"
                    style={{ width: "15%" }}
                    body={dateCreatedColumn}
                  />
                  <Column
                    field="forumPostStatus"
                    header="Status"
                    style={{ width: "5%" }}
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
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
