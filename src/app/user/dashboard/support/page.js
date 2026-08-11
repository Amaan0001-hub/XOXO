"use client";
export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addTicket,
  addTicketToList,
  getAllTicketBYURID,
} from "@/app/redux/slices/UserticketSlice";
import { Formik, Form, Field, ErrorMessage } from "formik";
import toast from "react-hot-toast";
import TicketTable from "./ticket-table/page";
import * as Yup from "yup";
import { getEncryptedLocalData } from "@/app/api/auth";
import { useSearchParams } from "next/navigation";
import Loader from "@/app/common/loading";
import { LifeBuoy, X } from "lucide-react";

const SupportContent = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  const { loading } = useSelector((state) => state.userticket);
  const [userId, setUserId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const userId = getEncryptedLocalData("UserId");
    setUserId(userId);
  }, []);

  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true") {
      setShowForm(true);
    }
  }, [searchParams]);

  const validationSchema = Yup.object({
    ticketType: Yup.string().required("Ticket type is required"),
    subject: Yup.string()
      .required("Subject is required")
      .min(5, "Subject must be at least 5 characters")
      .max(100, "Subject must not exceed 100 characters"),
    message: Yup.string()
      .required("Message is required")
      .min(10, "Message must be at least 10 characters")
      .max(1000, "Message must not exceed 1000 characters"),
    image: Yup.mixed()
      .nullable()
      .test("fileSize", "File size is too large", (value) => {
        if (!value) return true;
        return value.size <= 5 * 1024 * 1024;
      })
      .test("fileType", "Unsupported file type", (value) => {
        if (!value) return true;
        return ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
      }),
  });
  
  const initialValues = {
    ticketType: "",
    subject: "",
    message: "",
    // urid: userId || "",
    image: null,
  };

  const handleSubmit = async (values, { resetForm }) => {
    const data = new FormData();
    data.append("TicketType", values.ticketType);
    data.append("Subject", values.subject);
    data.append("Message", values.message);
    data.append("Seen", 1);
    // data.append("URID", values.urid);
    if (values.image) {
      data.append("ImagePath", values.image);
    }

    try {
      const result = await dispatch(addTicket(data)).unwrap();
      if (result.statusCode === 200) {
        toast.success(result.message);
        if (result.data) {
          dispatch(addTicketToList(result.data));
        } else {
          await dispatch(getAllTicketBYURID());
        }
        setIsSuccess(true);
        setShowForm(false);
        resetForm();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      toast.error("Failed to submit ticket");
    }
  };

  return (
    <div className=""> 
      {!showForm && (
        <div className="bt-create-btn-wrapper">
          <button
            className="bt-create-ticket-btn"
            onClick={() => setShowForm(true)}
          >
            <LifeBuoy size={18} />
            Create Ticket
          </button>
        </div>
      )}
      
      <div className="">
        {showForm && (
          <div className="bt-form-card">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bt-form-close"
            >
              <X className="w-5 h-5" />
            </button>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, values }) => (
                <Form className="bt-form">
                  <h1 className="bt-form-title">
                    Create Support Ticket
                  </h1>

                  {/* Ticket Type + Subject */}
                  <div className="bt-form-row">
                    <div className="bt-form-group">
                      <label className="bt-form-label">
                        Ticket Type
                      </label>
                      <Field
                        as="select"
                        name="ticketType"
                        className="bt-form-select"
                      >
                        <option value="">Select Ticket Type</option>
                        <option value="Profile">Profile</option>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Staking">Staking</option>
                        <option value="Incomes">Incomes</option>
                        <option value="Fund Deposit">Fund Deposit</option>
                        <option value="General">General Inquiry</option>
                      </Field>
                      <ErrorMessage
                        name="ticketType"
                        component="div"
                        className="bt-form-error"
                      />
                    </div>

                    <div className="bt-form-group">
                      <label className="bt-form-label">
                        Subject
                      </label>
                      <Field
                        type="text"
                        name="subject"
                        className="bt-form-input"
                        placeholder="Enter subject"
                      />
                      <ErrorMessage
                        name="subject"
                        component="div"
                        className="bt-form-error"
                      />
                    </div>
                  </div>

                  {/* Message + Attachment */}
                  <div className="bt-form-row">
                    <div className="bt-form-group">
                      <label className="bt-form-label">
                        Message
                      </label>
                      <Field
                        as="textarea"
                        name="message"
                        rows={4}
                        className="bt-form-textarea"
                        placeholder="Describe your issue in detail..."
                      />
                      <ErrorMessage
                        name="message"
                        component="div"
                        className="bt-form-error"
                      />
                    </div>

                    <div className="bt-form-group">
                      <label className="bt-form-label">
                        Attachment
                      </label>
                      <label className="bt-file-upload">
                        <svg
                          className="bt-file-icon"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                        </svg>
                        <span className="bt-file-name">
                          {values.image ? values.image.name : "Choose an image file"}
                        </span>
                        <input
                          type="file"
                          name="image"
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden bt-form-input"
                          onChange={(e) =>
                            setFieldValue("image", e.currentTarget.files[0])
                          }
                        />
                      </label>
                      <ErrorMessage
                        name="image"
                        component="div"
                        className="bt-form-error"
                      />
                      <p className="bt-file-hint">
                        Supported: JPEG, PNG, JPG (Max 5MB)
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bt-submit-btn"
                  >
                    {loading ? "Submitting..." : "Generate Ticket"}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        )}

        <TicketTable />
      </div>
    </div>
  );
};

const Support = () => (
  <Suspense
    fallback={
      <div>
        <Loader />
      </div>
    }
  >
    <SupportContent />
  </Suspense>
);

export default Support;

 