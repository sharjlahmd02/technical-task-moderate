import { useState, useRef } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import {
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  TableContainer,
  Heading,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";

// graphQL query to fetch customers data ---->  (altered the get_customer to fectch city_id for edit functionality)
const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      id
      name
      email
      role
      city_id
      city {
        name
      }
    }
  }
`;

// graphQL query to fetch cities for the dropdown option
const GET_CITIES = gql`
  query GetCities {
    cities {
      id
      name
    }
  }
`;

// graphQL mutation to insert a new customer
const ADD_CUSTOMER = gql`
  mutation AddCustomer(
    $name: String!
    $email: String!
    $role: String!
    $cityId: Int!
  ) {
    insert_customers_one(
      object: { name: $name, email: $email, role: $role, city_id: $cityId }
    ) {
      id
    }
  }
`;

// gql mutation to update an existing customer
const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer(
    $id: Int!
    $name: String!
    $email: String!
    $role: String!
    $cityId: Int!
  ) {
    update_customers_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name, email: $email, role: $role, city_id: $cityId }
    ) {
      id
    }
  }
`;

//gql to delete a customer
const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: Int!) {
    delete_customers_by_pk(id: $id) {
      id
    }
  }
`;

function Customer() {
  const { loading, error, data, refetch } = useQuery(GET_CUSTOMERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: citiesData } = useQuery(GET_CITIES);
  const [addCustomer, { loading: saving }] = useMutation(ADD_CUSTOMER, {
    onCompleted: () => {
      refetch();
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setRole("");
      setCityId("");
    },
  });

  const [updateCustomer, { loading: updating }] = useMutation(UPDATE_CUSTOMER, {
    onCompleted: () => {
      refetch();
      setIsModalOpen(false);
      setName("");
      setEmail("");
      setRole("");
      setCityId("");
      setEditingCustomer(null);
    },
  });

  
  const [deleteCustomer, { loading: deleting }] = useMutation(DELETE_CUSTOMER, {
    onCompleted: () => {
      refetch();
      setCustomerToDelete(null);
    }
  });

  //add new customer form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [cityId, setCityId] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customerToDelete, setCustomerToDelete] = useState<any>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // loading and error handling
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spinner size="xl" />
      </div>
    );
  if (error)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "red",
          fontWeight: "bold",
        }}
      >
        <Text>Something went wrong: {error.message}</Text>
      </div>
    );

  //save new customer data to the database or update existing customer data
  const handleSave = () => {
    if (editingCustomer) {
      updateCustomer({
        variables: {
          id: editingCustomer.id,
          name,
          email,
          role,
          cityId: Number(cityId),
        },
      });
    } else {
      addCustomer({
        variables: { name, email, role, cityId: Number(cityId) },
      });
    }
  };

  //edit customer data
  const handleEditClick = (customer: any) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setEmail(customer.email);
    setRole(customer.role);
    setCityId(String(customer.city_id));
    setIsModalOpen(true);
  };

  //handle delete customer logic
  const handleDelete = () => {
    deleteCustomer({ variables: { id: customerToDelete.id } });
  };

  // if everthing is fine show table data
  return (
    <Box p="7">
      <Heading mb="4" size="lg">
        Customers
      </Heading>
      <Button
        mb="4"
        colorScheme="blue"
        onClick={() => {
          setEditingCustomer(null);
          setName("");
          setEmail("");
          setRole("");
          setCityId("");
          setIsModalOpen(true);
        }}
      >
        Add New Record
      </Button>

      {/* table to show customer data */}

      <TableContainer border="1px solid" borderColor="gray.200" rounded="md">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>City</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.customers.map((customer: any) => (
              <Tr key={customer.id}>
                <Td>{customer.name}</Td>
                <Td>{customer.email}</Td>
                <Td>{customer.role}</Td>
                <Td>{customer.city.name}</Td>
                <Td>
                  <Button
                    colorScheme="green"
                    size="sm"
                    mr="3"
                    onClick={() => handleEditClick(customer)}
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => setCustomerToDelete(customer)}
                  >
                    Delete
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* modal for adding new customer */}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb="3">
              <FormLabel>Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Email</FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>Role</FormLabel>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter role"
              />
            </FormControl>
            <FormControl mb="3">
              <FormLabel>City</FormLabel>
              <Select
                placeholder="Select city"
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
              >
                {citiesData?.cities.map((city: any) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={2} onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={saving || updating}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Customer Modal */}
      <AlertDialog
        isOpen={!!customerToDelete}
        leastDestructiveRef={cancelRef}
        onClose={() => setCustomerToDelete(null)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Customer</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete {customerToDelete?.name}'s Data? This
              can't be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setCustomerToDelete(null)} mr="3">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} isLoading={deleting}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default Customer;
