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
  const [validityChecker, setValidityChecker] = useState({});

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
    try {
      setIsLoading(true);
      if (checkValidity(guidelines)) {
        setIsLoading(false);
        return;
      }

      const request = {
        forumGuidelines: guidelines.join("~"),
      };
      await updateForumCategory(
        request,
        category?.forumCategoryId,
        accessToken
      );
      setIsLoading(false);
      closeDialog(true);
    } catch (error) {
      console.log(error);
      closeDialog(close);
    }
  };

  const checkValidity = (guidelines) => {
    setValidityChecker({});
    let newValidityChecker = {};
    let hasInvalid = false;
    for (let i = 0; i < guidelines.length; i++) {
      newValidityChecker[i] = [];
      if (guidelines[i].length > 1000) {
        newValidityChecker[i].push("Too long! Max 1000 characters.");
        hasInvalid = true;
      }
      if (guidelines[i].length === 0) {
        newValidityChecker[i].push("Guideline cannot be empty!");
        hasInvalid = true;
      }
      if (guidelines[i].includes("~")) {
        newValidityChecker[i].push(
          "Contains invalid characters! Do not use `~`. "
        );
        hasInvalid = true;
      }
    }
    console.log(newValidityChecker);
    setValidityChecker(newValidityChecker);
    return hasInvalid;
  };
  return (
    <>
      {guidelines?.map((guideline, index) => (
        <div key={index} className={styles.forumGuideline}>
          <h3>{index + 1}.</h3>
          <div className={styles.inputText}>
            <InputTextarea
              className={validityChecker[index]?.length > 0 ? "p-invalid" : ""}
              autoResize
              value={guideline}
              onChange={(e) => editGuidelines(e.target.value, index)}
            />
            {validityChecker[index]?.length > 0 &&
              validityChecker[index].map((errorMessage, errorMessageIndex) => {
                return (
                  <small
                    key={errorMessageIndex}
                    className="p-invalid"
                    id="username-help"
                  >
                    {errorMessage}
                  </small>
                );
              })}
          </div>
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
