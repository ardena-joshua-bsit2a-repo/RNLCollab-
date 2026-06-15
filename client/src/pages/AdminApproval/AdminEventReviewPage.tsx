import ToastMessage from "../../components/ToastMessage/ToastMessage"
import { useModal } from "../../hooks/useModal"
import { useRefresh } from "../../hooks/useRefresh"
import { useToastMessage } from "../../hooks/useToastMessage"
import type { EventColumns } from "../../interfaces/EventInterface"
import AdminEventReviewList from "./components/AdminEventReviewList"

import AdminEventReviewModal from "./components/AdminEventReviewModal"

const AdminEventReviewPage = () => {

    const {
        isOpen: isReviewModalOpen,
        selectedItem: selectedEventForReview,
        openModal: openReviewModal,
        closeModal: closeReviewModal
    } = useModal<EventColumns>(false)

    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage
    } = useToastMessage("", false, false)

    const {
        refresh,
        handleRefresh
    } = useRefresh(false)

    return (
        <>
            <ToastMessage
                message={toastMessage}
                isVisible={toastMessageIsVisible}
                onClose={closeToastMessage}
            />

            <AdminEventReviewModal
                isOpen={isReviewModalOpen}
                onClose={closeReviewModal}
                event={selectedEventForReview}
                onReviewed={showToastMessage}
                refreshKey={handleRefresh}
            />

            <AdminEventReviewList
                onReviewEvent={(event) => openReviewModal(event)}
                refreshKey={refresh}
            />
        </>
    )
}

export default AdminEventReviewPage