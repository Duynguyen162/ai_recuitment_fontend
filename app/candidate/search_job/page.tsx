import JobListContainer from "@/components/jobs/JobListContainer";
import styles from "./search_job.module.scss";
export default function JobsPage() {
  return (
    <div className={styles.container}>
      <JobListContainer />
    </div>
  );
}
