import { createSlice } from "@reduxjs/toolkit";


const toastSlice = createSlice({
    name: 'toast',
    initialState: {
        messages: [],
    },
    reducers: {
        pushMessage(state, action) {
            const {status, text} = action.payload;
            const id = Date.now();
            state.messages.push({
                id,
                status,
                text
            })
        },
        removeMessage(state, action) {
            const message_id = action.payload;

            const index = state.messages.findIndex((message) => message.id === message_id);

            if(index !== -1) {
                state.messages.splice(index, 1);
            }
        }
    }
})

export const { pushMessage, removeMessage } = toastSlice.actions;
export default toastSlice.reducer;