import { useSearchParams } from "react-router-dom"
import ToastMessage from "../../components/ToastMessage/ToastMessage"
import { useModal } from "../../hooks/useModal"
import { useRefresh } from "../../hooks/useRefresh"
import { useToastMessage } from "../../hooks/useToastMessage"
import type { EventColumns } from "../../interfaces/EventInterface"
import AdminEventReviewList from "./components/AdminEventReviewList"
import AdminEventReviewModal from "./components/AdminEventReviewModal"

const AdminEventReviewPage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const highlightEventId = searchParams.get("event_id")

    const {
        isOpen: isReviewModalOpen,
        selectedItem: selectedEventForReview,
        openModal: openReviewModal,
        closeModal: closeReviewModal,
    } = useModal<EventColumns>(false)

    const {
        message: toastMessage,
        isVisible: toastMessageIsVisible,
        showToastMessage,
        closeToastMessage,
    } = useToastMessage("", false, false)

    const { refresh, handleRefresh } = useRefresh(false)

    // Clear the query param and close modal together
    const handleClose = () => {
        closeReviewModal()
        setSearchParams({})
    }

    return (
        <>
            <ToastMessage
                message={toastMessage}
                isVisible={toastMessageIsVisible}
                onClose={closeToastMessage}
            />

            <AdminEventReviewModal
                isOpen={isReviewModalOpen}
                onClose={handleClose}
                event={selectedEventForReview}
                onReviewed={showToastMessage}
                refreshKey={handleRefresh}
            />

            <AdminEventReviewList
                onReviewEvent={(event) => openReviewModal(event)}
                refreshKey={refresh}
                // ✅ pass the id so the list can auto-open it
                autoOpenEventId={highlightEventId ? Number(highlightEventId) : null}
                onAutoOpenHandled={() => setSearchParams({})}
                openModal={openReviewModal}
            />
        </>
    )
}

export default AdminEventReviewPage