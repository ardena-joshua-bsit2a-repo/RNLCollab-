import { useEffect, useState, type FormEvent } from "react";
import BackButton from "../../../components/Button/BackButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import Spinner from "../../../components/Spinner/Spinner";
import { useNavigate, useParams } from "react-router-dom";
import VenueService from "../../../services/VenueService";

const DeleteVenueForm = () => {
    const [loadingGet, setLoadingGet] = useState(false);
    const [loadingDestroy, setLoadingDestroy] = useState(false);
    const [venue, setVenue] = useState("");
    const [description, setDescription] = useState("");

    const { venue_id } = useParams();
    const navigate = useNavigate();

    const handleGetVenue = async (venue_id: string | number) => {
        try {
            setLoadingGet(true);

            const res = await VenueService.getVenue(venue_id);

            if (res.status === 200) {
                setVenue(res.data.venue.venue_name);
                setDescription(res.data.venue.venue_description || "");
            } else {
                console.error(
                    "Unexpected status error occured during deleting venue:",
                    res.status
                );
            }
        } catch (error) {
            console.error(
                "Unexpected server error occured during deleting venue:",
                error
            );
        } finally {
            setLoadingGet(false);
        }
    };

    const handleDestroyVenue = async (e: FormEvent) => {
        try {
            e.preventDefault();

            setLoadingDestroy(true);

            const res = await VenueService.destroyVenue(venue_id!);

            if (res.status === 200) {
                navigate("/venue", {
                    state: { message: res.data.message },
                });
            } else {
                console.error(
                    "Unexpected status error occured during deleting venue:",
                    res.status
                );
            }
        } catch (error) {
            console.error(
                "Unexpected server error occured during deleting venue:",
                error
            );
        } finally {
            setLoadingDestroy(false);
        }
    };

    useEffect(() => {
        if (venue_id) {
            const parsedVenueId = parseInt(venue_id);
            handleGetVenue(parsedVenueId);
        } else {
            console.error(
                "Unexpected parameter error occured during getting:",
                venue_id
            );
        }
    }, [venue_id]);

    return (
        <div className="max-w-2xl mx-auto mt-10">

            {/* Loading State */}
            {loadingGet ? (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" />
                </div>
            ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden">

                    {/* Header */}
                    <div className="border-b border-gray-800 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Delete Venue
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            This action cannot be undone.
                        </p>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleDestroyVenue} className="p-6 space-y-5">

                        {/* Warning Box */}
                        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-lg">
                            ⚠️ You are about to permanently delete this venue.
                        </div>

                        {/* Venue Info */}
                        <div className="space-y-4">

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">
                                    Venue Name
                                </p>
                                <p className="text-white font-semibold">
                                    {venue}
                                </p>
                            </div>

                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">
                                    Description
                                </p>
                                <p className="text-gray-300">
                                    {description || "No description provided"}
                                </p>
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-2 border-t border-gray-800">

                            <BackButton
                                label="Cancel"
                                path="/venue"
                            />

                            <SubmitButton
                                label="Delete Venue"
                                className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/20"
                                loading={loadingDestroy}
                                loadingLabel="Deleting..."
                            />

                        </div>

                    </form>
                </div>
            )}
        </div>
    );
};

export default DeleteVenueForm;