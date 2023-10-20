"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import styles from "./page.module.css";
import { Card } from "primereact/card";
import { getAllForumCategories, updateForumCategory } from "../api/forum/route";
import { useRouter } from "next/navigation";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { DialogBox } from "@/components/DialogBox/DialogBox";
import GuidelinesDisplay from "@/components/GuidelinesForm/GuidelinesForm";
import { InputText } from "primereact/inputtext";
import { addForumCategory } from "../api/forum/route";
import { Toast } from "primereact/toast";

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

  const toast = useRef(null);
  const [forumCategories, setForumCategories] = useState([]);
  const [filteredForumCategories, setFilteredForumCategories] = useState(null);
  const [selectedState, setSelectedState] = useState({
    name: "All",
    code: "All",
  });
  const [focusCategory, setFocusCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isArchiveDialog, setIsArchiveDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGuidelinesDialog, setIsGuidelinesDialog] = useState(false);
  const [isAddCategoryDialog, setIsAddCategoryDialog] = useState(false);
  const [addCategoryTitle, setAddCategoryTitle] = useState("");
  const [addCategoryError, setAddCategoryError] = useState("");

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
      setIsArchiveDialog(false);
      console.log("toast here");
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Successfully updated forum category status!",
        life: 5000,
      });
    } catch (error) {
      console.log(error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update forum post status.",
        life: 5000,
      });
    }
  };

  const addCategory = async (categoryTitle) => {
    if (categoryTitle.length >= 20) {
      setAddCategoryError("Category title too long! Max 20 characters");
      return;
    }
    if (categoryTitle.length == 0) {
      setAddCategoryError("Category title cannot be empty!");
      return;
    }
    try {
      setIsLoading(true);
      setAddCategoryError("");
      const request = {
        forumCategoryTitle: categoryTitle,
        isArchived: false,
        forumGuidelines: "",
      };
      await addForumCategory(request, accessToken);
      await initializeForumCategories();
      setIsLoading(false);
      setIsAddCategoryDialog(false);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Successfully added new category!",
        life: 5000,
      });
    } catch (error) {
      setIsLoading(false);
      setAddCategoryError(error.message);
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

  const footerButtons = (forumCategory) => {
    return (
      <div className={styles.footerButtons}>
        <Button
          text
          size="small"
          label="Details"
          severity="secondary"
          onClick={() =>
            router.push(`/forum/category?id=${forumCategory?.forumCategoryId}`)
          }
        />
        <Button
          text
          size="small"
          label="Guidelines"
          severity="info"
          onClick={() => {
            setSelectedCategory(forumCategory);
            setIsGuidelinesDialog(true);
          }}
        />
      </div>
    );
  };

  const archiveDialogButtons = (
    <div className="flex-container space-between">
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={() => setIsArchiveDialog(false)}
        className="p-button-text"
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        onClick={async () => {
          await archiveCategory(selectedCategory?.forumCategoryId);
        }}
        loading={isLoading}
        autoFocus
      />
    </div>
  );

  const addCategoryDialogButtons = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={() => setIsAddCategoryDialog(false)}
        className="p-button-text"
      />
      <Button
        label="Add"
        icon="pi pi-check"
        onClick={async () => {
          await addCategory(addCategoryTitle);
        }}
        loading={isLoading}
        autoFocus
      />
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      {isGuidelinesDialog && (
        <DialogBox
          header={`Guidelines for ${selectedCategory?.forumCategoryTitle}`}
          isOpen={isGuidelinesDialog}
          setVisible={setIsGuidelinesDialog}
        >
          <GuidelinesDisplay
            category={selectedCategory}
            accessToken={accessToken}
            closeDialog={(success) => {
              if (success) {
                initializeForumCategories();
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
      {isAddCategoryDialog && (
        <DialogBox
          header={"Add Forum Category"}
          isOpen={isAddCategoryDialog}
          setVisible={setIsAddCategoryDialog}
          footerContent={addCategoryDialogButtons}
        >
          <div className={styles.inputText}>
            <InputText
              id="categoryName"
              placeholder="Category Name"
              type="text"
              onChange={(e) => setAddCategoryTitle(e.target.value)}
              className={addCategoryError != "" ? "p-invalid" : ""}
            />
            {addCategoryError != "" && (
              <small className="p-error" id="categoryName-help">
                {addCategoryError}
              </small>
            )}
          </div>
        </DialogBox>
      )}
      {isArchiveDialog && (
        <DialogBox
          header={"Archive event category?"}
          content={
            "Are you sure you would like to archive this forum category?"
          }
          footerContent={archiveDialogButtons}
          isOpen={isArchiveDialog}
          setVisible={setIsArchiveDialog}
        />
      )}
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
          <Button
            outlined
            severity={"info"}
            className={styles.addButton}
            label={"Add"}
            icon="pi pi-plus"
            onClick={() => setIsAddCategoryDialog(true)}
          />
          <div className={styles.container}>
            {filteredForumCategories &&
              filteredForumCategories.map((forumCategory, index) => (
                <Card
                  key={index}
                  className={
                    forumCategory?.isArchived
                      ? styles.archivedCardBox
                      : styles.cardBox
                  }
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
                          onClick={() => {
                            setSelectedCategory(forumCategory);
                            setIsArchiveDialog(true);
                          }}
                        />
                      )}
                      {footerButtons(forumCategory)}
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
