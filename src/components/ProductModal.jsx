import { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import axios from "axios";
import { useDispatch } from "react-redux";
import { pushMessage } from "../slices/toastSlice";


// const { VITE_BASE_URL, VITE_API_PATH } = import.meta.env;
const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;



function ProductModal({ modalMode, myModalRef, tempProduct, getProducts }) {
    const [modalData, setModalData] = useState(tempProduct);

    useEffect(() => {
        setModalData({
            ...tempProduct,
        })
    }, [tempProduct])

    const productModalRef = useRef(null)
     
    
    useEffect(() => {
        myModalRef.current = new Modal(productModalRef.current,  {
        backdrop: false
        })
    }, [])

    // 用於在元件中觸發 actions，進行State更新。
    // 透過 useDispatch 可以直接呼叫 Store 的更新方法。
    const dispatch = useDispatch();

    // 關閉產品 Modal
    const handleCloseProductModal = () => {
        myModalRef.current.hide();
    }

    // 在各個 input 上監聽事件
    const handleModalInputChange = (e) => {
        const {name, value, type, checked} = e.target;
        setModalData({
            ...modalData,
            [name] : type === 'checkbox' ? checked : value
        });
    }
        
    // 綁定產品 Modal 多圖 input 狀態
    const handleImagesInputChange = (e, index) => {
        const {value} = e.target;
        const newImages = [...modalData.imagesUrl];
        newImages[index] = value;
        setModalData({
            ...modalData,
            imagesUrl: newImages
        })
    }
    // 圖片新增按鈕
    const addImage = () => {
        const newImages = [...modalData.imagesUrl, ''];
        setModalData({
            ...modalData,
            imagesUrl: newImages
        })
    }
    // 圖片取消按鈕
    const removeImage = () => {
        const newImages = [...modalData.imagesUrl];
        newImages.pop();
        setModalData({
            ...modalData,
            imagesUrl: newImages
        })
    }

    // 新增產品資料串接 POST API
    const createProduct = async () => {
        try {
            await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,{
            data: {
                ...modalData,
                price: Number(modalData.price),
                origin_price: Number(modalData.origin_price),
                is_enabled: modalData.is_enabled ? 1 : 0
            }
            })

            dispatch(pushMessage({
                status: 'success',
                text: '建立成功。'
            }))
        } catch (error) {
            const { message } = error.response.data;

            dispatch(pushMessage({
                status: 'fail',
                text: `失敗：
                ${message.join("、")}`,
            }))
        }
    }
    // 編輯產品資料串接 PUT API
    const updateProduct = async () => {
        try {
            await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${modalData.id}`,{
                data: {
                    ...modalData,
                    price: Number(modalData.price),
                    origin_price: Number(modalData.origin_price),
                    is_enabled: modalData.is_enabled ? 1 : 0
                }
            })

            dispatch(pushMessage({
                status: 'success',
                text: '編輯成功。'
            }))
        } catch (error) {
            dispatch(pushMessage({
                status: '失敗',
                text: '哎呀，失敗了。請再填寫一次。',
            }))
        }
    }    

    // 確認邏輯
    const handleUpdateProduct = async() => {
        const apiCall = modalMode === 'create' ? createProduct : updateProduct
        try {
          await apiCall();

          getProducts();

          handleCloseProductModal();
          
        } catch (error) {
            dispatch(pushMessage({
                status: '失敗',
                text: '哎呀，失敗了。請再填寫一次。',
            }))
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file-to-upload', file)
        
        try {
            const res = await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/upload`, formData);

            const uploadedImageUrl = res.data.imageUrl;
            setModalData({
                ...modalData,
                imageUrl: uploadedImageUrl
            })
        } catch (error) {
            dispatch(pushMessage({
                status: '失敗',
                text: '哎呀，失敗了。請再上傳一次。',
            }))
        }
        
    }

    return (
        <>
            {/* 加入產品 Modal */}
            <div id="productModal" ref={productModalRef} className="modal" style={{backgroundColor: "rgba(0,0,0,0.5)"}}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom">
                    <h5 className="modal-title fs-4">{modalMode === 'create' ? '新增資料' : '編輯資料'}</h5>
                    <button type="button" onClick={handleCloseProductModal} className="btn-close" aria-label="Close"></button>
                </div>
                
                <div className="modal-body p-4">
                    <div className="row g-4">
                    <div className="col-md-4">
                        <div className="mb-5">
                        <label htmlFor="fileInput" className="form-label"> 圖片上傳 </label>
                        <input
                            type="file" 
                            onChange={handleFileChange} 
                            accept=".jpg,.jpeg,.png"
                            className="form-control"
                            id="fileInput"
                        />
                        </div>
                        <div className="mb-4">
                        <label htmlFor="primary-image" className="form-label">
                            圖片
                        </label>
                        <div className="input-group">
                            <input  value={modalData.imageUrl} 
                            onChange={handleModalInputChange} 
                            name="imageUrl"
                            type="text"
                            id="primary-image"
                            className="form-control"
                            placeholder="請輸入圖片連結"
                            />
                        </div>
                        <img
                            src={modalData.imageUrl}
                            alt={modalData.title}
                            className="img-fluid"
                        />
                        </div>

                        {/* 副圖 */}
                        <div className="border border-2 border-dashed rounded-3 p-3">
                        {modalData.imagesUrl?.map((image, index) => (
                            <div key={index} className="mb-2">
                            <label
                                htmlFor={`imagesUrl-${index + 1}`}
                                className="form-label"
                            >
                                (副)圖 {index + 1}
                            </label>
                            <input value={image} 
                                onChange={(e) => {
                                handleImagesInputChange(e, index)
                                }} 
                                id={`imagesUrl-${index + 1}`}
                                type="text"
                                placeholder={`圖片網址 ${index + 1}`}
                                className="form-control mb-2"
                            />
                            {image && (
                                <img
                                src={image}
                                alt={`(副)圖 ${index + 1}`}
                                className="img-fluid mb-2"
                                />
                            )}
                            </div>
                        ))}
                        <div className="btn-group w-100">
                        
                        {modalData.imagesUrl.length < 5 && modalData.imagesUrl[modalData.length - 1] !== '' && (<button onClick={addImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}               
                        {modalData.imagesUrl.length > 1 && (<button onClick={removeImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>)}
                        </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                            標題
                        </label>
                        <input value={modalData.title} 
                            onChange={handleModalInputChange} 
                            name="title"
                            id="title"
                            type="text"
                            className="form-control"
                            placeholder="請輸入標題"
                        />
                        </div>

                        <div className="mb-3">
                        <label htmlFor="category" className="form-label">
                            分類
                        </label>
                        <input value={modalData.category} 
                            onChange={handleModalInputChange} 
                            name="category"
                            id="category"
                            type="text"
                            className="form-control"
                            placeholder="請輸入分類"
                        />
                        </div>

                        <div className="mb-3">
                        <label htmlFor="unit" className="form-label">
                            單位
                        </label>
                        <input value={modalData.unit} 
                            onChange={handleModalInputChange} 
                            name="unit"
                            id="unit"
                            type="text"
                            className="form-control"
                            placeholder="請輸入單位"
                        />
                        </div>

                        <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label htmlFor="origin_price" className="form-label">
                            原價
                            </label>
                            <input
                            value={modalData.origin_price}
                            onChange={(e) => {
                                const value = Math.max(0, Number(e.target.value)); // 限制最小值為 0
                                handleModalInputChange({ target: { name: "origin_price", value } });
                            }}
                            name="origin_price"
                            id="origin_price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入原價"
                            min="0" // 限制 UI 不讓使用者減少到負數
                            />
                        </div>
                        <div className="col-6">
                            <label htmlFor="price" className="form-label">
                            售價
                            </label>
                            <input
                            value={modalData.price}
                            onChange={(e) => {
                                const value = Math.max(0, Number(e.target.value)); // 限制最小值為 0
                                handleModalInputChange({ target: { name: "price", value } });
                            }}
                            name="origin_price"
                            id="origin_price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入原價"
                            min="0" // 限制 UI 不讓使用者減少到負數
                            />
                        </div>
                        </div>

                        <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                            產品描述
                        </label>
                        <textarea  value={modalData.description} 
                            onChange={handleModalInputChange} 
                            name="description"
                            id="description"
                            className="form-control"
                            rows={4}
                            placeholder="請輸入產品描述"
                        ></textarea>
                        </div>

                        <div className="mb-3">
                        <label htmlFor="content" className="form-label">
                            說明內容
                        </label>
                        <textarea  value={modalData.content} 
                            onChange={handleModalInputChange} 
                            name="content"
                            id="content"
                            className="form-control"
                            rows={4}
                            placeholder="請輸入說明內容"
                        ></textarea>
                        </div>

                        <div className="form-check">
                        <input checked={modalData.is_enabled} 
                            onChange={handleModalInputChange} 
                            name="is_enabled"
                            type="checkbox"
                            className="form-check-input"
                            id="isEnabled"
                        />
                        <label className="form-check-label" htmlFor="isEnabled">
                            是否啟用
                        </label>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="modal-footer border-top bg-light">
                    <button onClick={handleCloseProductModal} type="button" className="btn btn-secondary">
                    取消
                    </button>
                    <button type="button" onClick={handleUpdateProduct} className="btn btn-primary">
                    確認
                    </button>
                </div>
                </div>
            </div>
            </div>
        </>
    )
}

export default ProductModal