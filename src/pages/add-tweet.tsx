import axios from 'axios';
import { useForm } from 'react-hook-form';

const AddTweet = () => {
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = handleSubmit(async (data) => {
        await axios.post('/api/add-tweet/', {
            ...data,
        });

        reset();
    });

    return (
        <form onSubmit={onSubmit}>
            <label>
                Message:
                <input type="text" {...register('message')} />
            </label>

            <label>
                Scheduled date:
                <input
                    type="datetime-local"
                    {...register('scheduledDate', { valueAsDate: true })}
                />
            </label>

            <input type="submit" value="Submit" />
        </form>
    );
};

export default AddTweet;