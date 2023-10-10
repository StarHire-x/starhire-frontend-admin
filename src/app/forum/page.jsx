"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import styles from "./page.module.css";
import { Card } from "primereact/card";
import { getAllForumCategories, updateForumCategory } from "../api/forum/route";
import { useRouter } from "next/navigation";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";

const ForumPage = () => {
  const session = useSession();
  const router = useRouter();
  if (session.status === "unauthenticated") {
    router?.push("/login");
  }

  const accessToken =
    session.status === "authenticated" &&
    session.data &&
    session.data.user.accessToken;

  const [forumCategories, setForumCategories] = useState([]);
  const [filteredForumCategories, setFilteredForumCategories] = useState(null);
  const [selectedState, setSelectedState] = useState({
    name: "All",
    code: "All",
  });
  const [focusCategory, setFocusCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const initializeForumCategories = async (state) => {
    try {
      const allForumCategories = await getAllForumCategories(accessToken);
      setForumCategories(allForumCategories);
    } catch (error) {
      console.log(error);
    }
  };

  const archiveCategory = async (categoryId) => {
    try {
      setIsLoading(true);
      const request = {
        isArchived: true,
      };
      await updateForumCategory(request, categoryId, accessToken);
      await initializeForumCategories();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const states = [
    { name: "All", code: "All" },
    { name: "Active", code: "Active" },
    { name: "Archived", code: "Archived" },
  ];

  useEffect(() => {
    initializeForumCategories();
  }, [accessToken]);

  useEffect(() => {
    if (selectedState.code === "All") {
      setFilteredForumCategories(forumCategories);
    } else if (selectedState.code === "Active") {
      setFilteredForumCategories([
        ...forumCategories.filter((category) => category.isArchived === false),
      ]);
    } else {
      setFilteredForumCategories([
        ...forumCategories.filter((category) => category.isArchived === true),
      ]);
    }
  }, [selectedState, forumCategories]);

  const footerButtons = (
    <div className={styles.footerButtons}>
      <Button size="small" label="Details" severity="info" />
      <Button size="small" label="Guidelines" severity="success" />
    </div>
  );

  return (
    <>
      {isLoading && <ProgressSpinner />}
      {!isLoading && (
        <>
          <div className={styles.heading}>
            <h2>Forum Categories</h2>
            <Dropdown
              className={styles.dropdown}
              value={selectedState}
              onChange={(e) => setSelectedState(e.value)}
              options={states}
              optionLabel="name"
            />
          </div>
          <div className={styles.container}>
            {filteredForumCategories &&
              filteredForumCategories.map((forumCategory, index) => (
                <Card
                  className={
                    forumCategory?.isArchived
                      ? styles.archivedCardBox
                      : styles.cardBox
                  }
                  onClick={() => console.log("hello")}
                  onMouseOver={() => setFocusCategory(index)}
                  onMouseLeave={() => setFocusCategory(null)}
                >
                  <div className={styles.category}>
                    <h2>{forumCategory?.forumCategoryTitle}</h2>
                  </div>
                  {focusCategory === index ? (
                    <>
                      {!forumCategory.isArchived && (
                        <Button
                          className={styles.deleteButton}
                          icon="pi pi-times"
                          rounded
                          text
                          severity="danger"
                          aria-label="Cancel"
                          onClick={() =>
                            archiveCategory(forumCategory?.forumCategoryId)
                          }
                        />
                      )}
                      {footerButtons}
                    </>
                  ) : (
                    <></>
                  )}
                </Card>
              ))}
          </div>
        </>
      )}
    </>
  );
};

export default ForumPage;
