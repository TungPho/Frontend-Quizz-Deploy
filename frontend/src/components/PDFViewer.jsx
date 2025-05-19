import { useState } from "react";
import { Document, Page } from "react-pdf";
import { pdfjs } from "react-pdf";
import PropTypes from "prop-types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
// Cài đặt worker cho react-pdf

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error("Lỗi khi tải PDF:", error);
    setError("Không thể tải tài liệu PDF. Vui lòng thử lại sau.");
    setLoading(false);
  };

  const changePage = (offset) => {
    setPageNumber((prevPageNumber) =>
      Math.max(1, Math.min(prevPageNumber + offset, numPages))
    );
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.5));
  };

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center w-full ml-2  bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-center">
          Chọn một tài liệu PDF để xem
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-400 p-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1 || loading}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            pageNumber <= 1 || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          &lt; Previous Page
        </button>

        <span className="px-2 py-1 bg-white rounded-md text-green-800 text-sm">
          Trang {pageNumber} / {numPages || "?"}
        </span>

        <button
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages || loading}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            pageNumber >= numPages || loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Next Page &gt;
        </button>

        <div className="flex items-center bg-white rounded-md overflow-hidden">
          <button
            onClick={zoomOut}
            disabled={loading}
            className={`w-8 h-8 flex items-center justify-center text-lg font-bold ${
              loading ? "text-gray-400" : "text-green-600 hover:bg-green-100"
            }`}
          >
            -
          </button>

          <span className="px-2 text-sm text-green-800">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={zoomIn}
            disabled={loading}
            className={`w-8 h-8 flex items-center justify-center text-lg font-bold ${
              loading ? "text-gray-400" : "text-green-600 hover:bg-green-100"
            }`}
          >
            +
          </button>
        </div>
      </div>

      <div className="p-4 flex justify-center bg-gray-50 min-h-96">
        {error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                <p className="ml-3 text-green-600">Đang tải tài liệu...</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div>
                  <p className="ml-2 text-green-600 text-sm">
                    Đang tải trang...
                  </p>
                </div>
              }
              className="shadow-md"
            />
          </Document>
        )}
      </div>
    </div>
  );
};

PDFViewer.propTypes = {
  pdfUrl: PropTypes.string,
};

export default PDFViewer;
