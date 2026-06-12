import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import IconPanahKiri from "../../../assets/icons/carbon_next-filled.svg";
import IconPanahKanan from "../../../assets/icons/carbon_next-filled-right.svg";
import { get_dataset_by_id_dataset } from "../utils/data_collection_api";

function DetailDataset() {
  const [detailDataset, setDetailDataset] = useState([]);
  const { idDataset } = useParams();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadDetailDataset = async (idDataset) => {
    try {
      const response = await get_dataset_by_id_dataset(idDataset);
      console.log("Detail dataset:", response);
      setDetailDataset(response?.data || []);
    } catch (error) {
      console.error("Error fetching data", error);
      setDetailDataset([]);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(detailDataset.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = detailDataset.slice(startIndex, startIndex + itemsPerPage);

  
  useEffect(() => {
    if (idDataset) {
      loadDetailDataset(idDataset);
    }
  }, [idDataset]);

  return (
    <div className="content detail-dataset">
      <h1>Detail Dataset</h1>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Name</th>
            <th>Label</th>
            <th>Sequence Length</th>
            <th>Preview</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((dataset, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{dataset.dataName || dataset.dataFilePath?.split(/[\/\\]/).pop()}</td>
              <td>{dataset.idLabel}</td>
              <td>{dataset.sequenceLength}</td>
              <td></td>
              <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination-display">
        <button><a href="/admin/data-collection">Kembali</a></button>
        <div className="pagination">
          <div 
            className="left"
            style={{ cursor: currentPage > 1 ? 'pointer' : 'not-allowed', opacity: currentPage > 1 ? 1 : 0.5 }}
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          >
            <img src={IconPanahKiri} className="blackIcon" alt="Sebelumnya" />
            {/* <p>Sebelumnya</p> */}
          </div>
          <div className="pages-count">
            <p>Halaman {currentPage} dari {totalPages}</p>
          </div>
          <div 
            className="right"
            style={{ cursor: currentPage < totalPages ? 'pointer' : 'not-allowed', opacity: currentPage < totalPages ? 1 : 0.5 }}
            onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          >
            {/* <p>Setelahnya</p> */}
            <img src={IconPanahKanan} className="blackIcon" alt="Setelahnya" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailDataset;