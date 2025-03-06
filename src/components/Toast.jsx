import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Toast as BsToast } from "bootstrap"
import { removeMessage } from "../slices/toastSlice"

export default function Toast() {
    const messages = useSelector((state) => state.toast.messages)
    const toastRefs = useRef({})
    const dispatch = useDispatch()

    useEffect(() => {
        messages.forEach((message) => {
            const toastElement = toastRefs.current[message.id]

            if(toastElement) {
                const toastInstance = new BsToast(toastElement);

                toastInstance.show();

                setTimeout(() => {
                    dispatch(removeMessage(message.id))
                }, 7000);
            }
        })
    },[messages])
    // toaste 關閉按鈕
    const handleDismissBtn = (message_id) => {
        dispatch(removeMessage(message_id))
    }

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000 }}>
            {messages.map((message) => (
                    <div key={message.id} ref={(el) => toastRefs.current[message.id] = el} className="toast" role="alert" aria-live="assertive" aria-atomic="true">
                        <div className={`toast-header ${message.status === 'success' ? 'bg-success' : 'bg-danger'} text-white`}>
                            <strong className="me-auto">{message.status === 'success' ? '成功' : '失敗'}</strong>
                            <button
                                onClick={() => handleDismissBtn(message.id)}
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="toast-body">{message.text}</div>
                    </div>                  
                ))}
        </div>
    )
}