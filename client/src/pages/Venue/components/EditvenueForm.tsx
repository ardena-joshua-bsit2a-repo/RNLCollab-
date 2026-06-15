import { useEffect, useState, type FC, type FormEvent } from "react";
import BackButton from "../../../components/Button/BackButton";
import SubmitButton from "../../../components/Button/SubmitButton";
import FloatingLabelInput from "../../../components/Input/FloatingLabelInput";
import Spinner from "../../../components/Spinner/Spinner";
import VenueService from "../../../services/VenueService";
import { useParams } from "react-router-dom";
import type { RoleFieldErrors } from "../../../interfaces/RoleInterface";

interface EditVenueFormProps {
    onVenueUpdated: (message: string) => void;
}

const EditVenueForm: FC<EditVenueFormProps> = ({ onVenueUpdated }) => {
    const [loadingGet, setLoadingGet] = useState(false);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const [venue, setVenue] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<RoleFieldErrors>({});

    const { venue_id } = useParams();

    const handleGetVenue = async (venue_id: string | number) => {
        try {
            setLoadingGet(true);

            const res = await VenueService.getVenue(venue_id);

            if (res.status === 200) {
                setVenue(res.data.venue.venue_name);
                setDescription(res.data.venue.venue_description || "");
            } else {
                console.error(
                    "Unexpected status error occured during getting venue:",
                    res.status
                );
            }
        } catch (error) {
            console.log(
                "Unexpected server error occured during getting venue:",
                error
            );
        } finally {
            setLoadingGet(false);
        }
    };

    const handleUpdateVenue = async (e: FormEvent) => {
        try {
            e.preventDefault();

            setLoadingUpdate(true);

            const res = await VenueService.updateVenue(venue_id!, {
                venue_name: venue,
                venue_description: description,
            });

            if (res.status === 200) {
                setErrors({});
                setVenue(res.data.venue.venue_name);
                onVenueUpdated(res.data.message);
            } else {
                console.error(
                    "Unexpected status error occured during updating venue:",
                    res.status
                );
            }
        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error(
                    "Unexpected server error occured during updating venue:",
                    error
                );
            }
        } finally {
            setLoadingUpdate(false);
        }
    };

    useEffect(() => {
        if (venue_id) {
            const parsedVenueId = parseInt(venue_id);
            handleGetVenue(parsedVenueId);
        } else {
            console.error(
                "Unexpected parameter error occured during getting venue:",
                venue_id
            );
        }
    }, [venue_id]);

    return (
        <div className="max-w-2xl mx-auto">

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
                            Edit Venue
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Update venue information below
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleUpdateVenue} className="p-6 space-y-5">

                        {/* Venue Name */}
                        <FloatingLabelInput
                            label="Venue"
                            type="text"
                            name="venue"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            required
                            autoFocus
                            errors={errors.venue_name}
                        />

                        {/* Description */}
                        <FloatingLabelInput
                            label="Description"
                            type="text"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            errors={errors.venue_description}
                        />

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-2 border-t border-gray-800">

                            {!loadingUpdate && (
                                <BackButton
                                    label="Back"
                                    path="/venue"
                                />
                            )}

                            <SubmitButton
                                label="Update Venue"
                                loading={loadingUpdate}
                                loadingLabel="Updating Venue..."
                                className="px-4 py-3 rounded-lg bg-emerald-500/10 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            />

                        </div>

                    </form>
                </div>
            )}
        </div>
    );
};

export default EditVenueForm;