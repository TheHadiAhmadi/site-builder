import { html } from "svelite-html";

export function DeleteConfirm() {
    return html`
        <div data-delete-confirm>
            <div data-confirm-body>
                <h3 data-confirm-title></h3>
                <p data-confirm-description></p>

                <div data-confirm-actions>
                    <button data-action="confirm.close" data-button data-button-block>No</button>
                    <button data-action="confirm.handle" data-button data-button-block data-button-color="danger">Yes</button>
                </div>
            </div>
        </div>
    `
}
