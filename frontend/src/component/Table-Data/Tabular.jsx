// import React, { useMemo } from 'react';
// import { useTable, useSortBy, useFilters } from 'react-table';




// const TaskTable = ({ tasks }) => {
//   // Define the columns for the table
//   const columns = useMemo(
//     () => [
//       {
//         Header: 'Title',
//         accessor: 'title', // This is the key in the task object
//       },
//       {
//         Header: 'Description',
//         accessor: 'description',
//       },
//       {
//         Header: 'Status',
//         accessor: 'status',
//       },
//       {
//         Header: 'Priority',
//         accessor: 'priority',
//       },
//       {
//         Header: 'Due Date',
//         accessor: 'dueDate',
//       },
//     ],
//     []
//   );

//   // Use the react-table hooks
//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     rows,
//     prepareRow,
//     setFilter,
//     state: { filters },
//   } = useTable(
//     {
//       columns,
//       data: tasks,
//     },
//     useFilters, // Add filtering feature
//     useSortBy // Add sorting feature
//   );

//   return (
//     <div>
//       {/* Filter Input */}
//       <div>
//         <label>Search: </label>
//         <input
//           value={filters.length > 0 ? filters[0].value : ''}
//           onChange={(e) => setFilter('title', e.target.value)} // Filtering by title
//           placeholder="Search tasks"
//         />
//       </div>

//       <table {...getTableProps()} border="1" style={{ width: '100%', marginTop: '20px' }}>
//         <thead>
//           {headerGroups.map((headerGroup) => (
//             <tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column) => (
//                 <th {...column.getHeaderProps(column.getSortByToggleProps())}>
//                   {column.render('Header')}
//                   {/* Add sorting indicator */}
//                   <span>
//                     {column.isSorted
//                       ? column.isSortedDesc
//                         ? ' 🔽'
//                         : ' 🔼'
//                       : ''}
//                   </span>
//                 </th>
//               ))}
//             </tr>
//           ))}
//         </thead>
//         <tbody {...getTableBodyProps()}>
//           {rows.map((row) => {
//             prepareRow(row);
//             return (
//               <tr {...row.getRowProps()}>
//                 {row.cells.map((cell) => {
//                   return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
//                 })}
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default TaskTable;


import React, { useEffect, useState } from 'react';
import { useTable, useSortBy, useFilters } from 'react-table';
import axios from 'axios';
import { Link } from 'react-router-dom';

const TaskTable = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const user =localStorage.getItem('username')

  // Fetching task data from the API
  useEffect(() => {
    axios
      .get('http://localhost:8000/task/showtask')
      .then((response) => {
        setTasks(response.data.data);
      })
      .catch((err) => {
        console.error(err);
        setError('Error fetching tasks');
      });
  }, []);

  // Define table columns
  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: '_id', // Accessor corresponds to the field in your task object
      },
      {
        Header: 'Title',
        accessor: 'title',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      {
        Header: 'Priority',
        accessor: 'priority',
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div>
                {
                  user ?(
                    <Link to={`/taskedit/${row.original._id}`} className="btn bg-info mx-2">
                    Edit
                  </Link>
                  ):("Login first")
                }
            {/* <button
              className="btn bg-danger"
              onClick={() => handleDelete(row.original._id)}
            >
              Delete
            </button> */}
          </div>
        ),
      },
    ],
    []
  );

  // Table hooks for sorting and filtering
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter,
  } = useTable(
    {
      columns,
      data: tasks,
    },
    useFilters, // Enable filtering
    useSortBy // Enable sorting
  );

  // Handle task deletion (you should define the `handleDelete` function)
  const handleDelete = (taskId) => {
    // Your delete logic here (e.g., make a DELETE request to the API)
    console.log('Delete task with id:', taskId);
  };

  // Handle filtering (example: filtering by status)
  const handleStatusFilterChange = (e) => {
    setFilter('status', e.target.value || undefined);
  };

  return (
    <div>
      {/* Filter by Status */}
      <div>
        <label htmlFor="status-filter">Filter by Status:</label>
        <input
          id="status-filter"
          type="text"
          onChange={handleStatusFilterChange}
          placeholder="Type status to status"
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table {...getTableProps()} className="table table-hover mt-4">
          <thead>

            {headerGroups.map((headerGroup) => (
                
              <tr  {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))
            
            }
          </thead>
          <tbody {...getTableBodyProps()}>
            { rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  { (
                    row.cells.map((cell) => {
                      return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                    })
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Error message */}
      {error && <p className="text-danger text-center">{error}</p>}
    </div>
  );
};

export default TaskTable;
