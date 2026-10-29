import Swal from "sweetalert2";

const confirmDelete = async () => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to recover this data!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#6c757d",
    reverseButtons: true,
  });

  return result.isConfirmed;
};

export default confirmDelete;