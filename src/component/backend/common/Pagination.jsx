// Shared server-side pagination control. Renders a windowed set of page
// numbers (first, last, and a few around the current page) instead of one
// button per page, which used to make long lists render hundreds of
// buttons. `currentPage`/`lastPage` come straight from the Laravel
// paginator response (`current_page`/`last_page`).
const Pagination = ({ currentPage, lastPage, onChange }) => {
    if (!lastPage || lastPage <= 1) return null;

    const pages = [];
    const windowSize = 1;

    for (let page = 1; page <= lastPage; page++) {
        const isEdge = page === 1 || page === lastPage;
        const isNearCurrent = Math.abs(page - currentPage) <= windowSize;

        if (isEdge || isNearCurrent) {
            pages.push(page);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div className="pagination-area">
            <button
                type="button"
                className="prev page-numbers"
                onClick={() => onChange(currentPage - 1)}
                disabled={currentPage <= 1}
            >
                <i className="bi bi-chevron-double-left" />
            </button>

            {pages.map((page, index) =>
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="page-numbers" style={{ boxShadow: 'none', cursor: 'default' }}>
                        &hellip;
                    </span>
                ) : (
                    <button
                        type="button"
                        key={page}
                        className={`page-numbers ${currentPage === page ? 'current' : ''}`}
                        onClick={() => onChange(page)}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                type="button"
                className="next page-numbers"
                onClick={() => onChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
            >
                <i className="bi bi-chevron-double-right" />
            </button>
        </div>
    );
};

export default Pagination;
