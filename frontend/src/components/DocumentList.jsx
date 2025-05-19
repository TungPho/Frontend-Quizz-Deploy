import PropTypes from "prop-types";

const DocumentList = ({ documents, onSelectDocument, onDeleteDocument }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (!documents.length) {
    return (
      <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-medium border border-green-200">
        Chưa có tài liệu nào
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="bg-green-400 text-white text-xl font-bold py-3 px-4">
        Danh sách tài liệu
      </h2>
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li
            key={doc._id}
            className="hover:bg-green-50 transition duration-150"
          >
            <div className="flex items-center justify-between p-4">
              <div
                className="flex-grow cursor-pointer"
                onClick={() => onSelectDocument(doc)}
              >
                <div className="font-medium text-gray-800">{doc.filename}</div>
                <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row sm:space-x-4">
                  <span className="mb-1 sm:mb-0">
                    Ngày tải lên: {formatDate(doc.createdAt)}
                  </span>
                  <span>Kích thước: {formatFileSize(doc.size)}</span>
                </div>
              </div>
              <button
                className="ml-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm transition duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDocument(doc._id);
                }}
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

DocumentList.propTypes = {
  documents: PropTypes.array.isRequired,
  onSelectDocument: PropTypes.func.isRequired,
  onDeleteDocument: PropTypes.func.isRequired,
};

export default DocumentList;
