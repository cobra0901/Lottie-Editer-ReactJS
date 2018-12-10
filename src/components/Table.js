import React from 'react';

import DataTable from 'react-dt';

const Table = props => <DataTable {...tableProps} {...props} />;

const tableProps = {
  cellProps: { style: { padding: 0 } }
};

export default Table;
