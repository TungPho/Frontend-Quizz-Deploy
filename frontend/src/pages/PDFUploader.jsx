import { useState, useEffect } from "react";
import FileUpload from "../components/FileUpload";
import DocumentList from "../components/DocumentList";
import PDFViewer from "../components/PDFViewer";

function PDFUploader() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    console.log(userID);
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/v1/documents/${userID}`
      );
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách tài liệu");
      }
      const data = await response.json();
      console.log("Data", data);
      setDocuments(data.metadata);
      setError(null);
    } catch (err) {
      setError("Lỗi khi tải danh sách tài liệu: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (newDocument) => {
    setDocuments([...documents, newDocument]);
    setSelectedDocument(newDocument);
  };

  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/v1/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );
      console.log(response);
      if (!response.ok) {
        throw new Error("Không thể xóa tài liệu");
      }
      setDocuments(documents.filter((doc) => doc._id !== documentId));

      if (selectedDocument && selectedDocument._id === documentId) {
        setSelectedDocument(null);
      }
    } catch (err) {
      console.error("Lỗi khi xóa tài liệu:", err);
      alert("Lỗi khi xóa tài liệu: " + err.message);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="">
        <FileUpload onFileUpload={handleFileUpload} />
        {loading ? (
          <div className="loading">Đang tải danh sách tài liệu...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <DocumentList
            documents={documents}
            onSelectDocument={handleSelectDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}
      </div>

      <PDFViewer pdfUrl={selectedDocument ? selectedDocument.fileUrl : null} />
    </div>
  );
}

export default PDFUploader;
