"use client";

import React from "react";
import { Toaster } from "react-hot-toast";

import JobForm from "../_components/JobForm";

export default function CreateJobPage() {
  return (
    <>
      <JobForm mode="create" />
      <Toaster />
    </>
  );
}
