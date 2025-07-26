import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { databases } from './appwrite';

const DATABASE_ID = '6851839e00173225abcd';
// TODO: Fill in your 5 collection IDs here
const COLLECTION_IDS = ['68827117003a4f156ee6', '688272a3001605845318', '68809f960016a51edb61', '', ''];

function ActionPage() {
  const { index } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const label = location.state?.label || '';
  const collectionId = COLLECTION_IDS[index] || '';
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          DATABASE_ID,
          collectionId
        );
        setDocuments(response.documents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (collectionId) fetchData();
  }, [collectionId]);

  const stuffs = ['Стимуляторы', 'Эйфоретики', 'Психоделики', 'Марихуана', 'Аптека', 'Опиаты'];
  const [selectedCategories, setSelectedCategories] = useState([]);

  const filteredDocuments =
    selectedCategories.length > 0
      ? documents.filter(doc => selectedCategories.includes(doc.category))
      : documents;

  return (
    <div className="action-page">
      <div className="action-header">
        <button className="back-arrow" onClick={() => navigate(-1)}>
          &larr; Назад
        </button>
        <h2 className="action-title">{label}</h2>
      </div>
      {index == 0 && (
        <div className='filcontainer'>
          <h3>Фильтры</h3>
          <div className='filtres'>
            <div className="filter-list">
              {stuffs.map((label, idx) => (
                <button
                  key={idx}
                  className={`filter-btn ${selectedCategories.includes(idx) ? 'selected' : ''}`}
                  onClick={() => {
                    if (selectedCategories.includes(idx)) {
                      setSelectedCategories(selectedCategories.filter(i => i !== idx));
                    } else {
                      setSelectedCategories([...selectedCategories, idx]);
                    }
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="action-content">
        {loading ? (
          <div className="loader"></div>
        ) : (
        <>
            {filteredDocuments.map(doc => (
              <div key={doc.$id} className='product'>
                <img
                src={doc.img}
                />
                <p>{doc.name}</p>
              </div>
            ))}
            </>
        )}
      </div>
    </div>
  );
}

export default ActionPage;