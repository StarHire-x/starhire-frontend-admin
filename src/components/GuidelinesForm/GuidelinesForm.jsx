"use client";
import { InputTextarea } from "primereact/inputtextarea";
import React, { useState, useEffect } from "react";
import styles from "./GuidelinesForm.module.css";
import { Button } from "primereact/button";
import { updateForumCategory } from "@/app/api/forum/route";

const GuidelinesDisplay = ({ category, accessToken, closeDialog }) => {
  const [guidelines, setGuidelines] = useState(
    category?.forumGuidelines?.split("~")
  );
  const [isLoading, setIsLoading] = useState(false);

  const editGuidelines = (updatedGuideline, index) => {
    let newGuidelines = guidelines;
    newGuidelines[index] = updatedGuideline;
    setGuidelines([...newGuidelines]);
  };

  const removeGuideline = (index) => {
    let newGuidelines = guidelines;
    newGuidelines.splice(index, 1);
    setGuidelines([...newGuidelines]);
  };

  const addRow = () => {
    setGuidelines([...guidelines, []]);
  };

  const saveGuidelines = async () => {
    setIsLoading(true);
    const request = {
      forumGuidelines: guidelines.join("~"),
    };
    await updateForumCategory(request, category?.forumCategoryId, accessToken);
    setIsLoading(false);
    closeDialog();
  };
  return (
    <>
      {guidelines?.map((guideline, index) => (
        <div className={styles.forumGuideline}>
          <h3>{index + 1}.</h3>
          <InputTextarea
            autoResize
            className={styles.forumGuidelineInput}
            value={guideline}
            onChange={(e) => editGuidelines(e.target.value, index)}
          />
          <Button
            className={styles.cancelButton}
            size="small"
            icon="pi pi-times"
            severity="danger"
            aria-label="Cancel"
            onClick={() => removeGuideline(index)}
          />
        </div>
      ))}
      <div className={styles.footer}>
        <Button
          label="Add Row"
          severity="secondary"
          raised
          onClick={() => addRow()}
        />
        <Button
          label="Save"
          severity="success"
          raised
          loading={isLoading}
          onClick={() => saveGuidelines()}
        />
      </div>
    </>
  );
};

export default GuidelinesDisplay;
