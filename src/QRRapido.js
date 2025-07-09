import './App.css';
import loader from './assets/loader.gif';
import {
  Form, FormGroup, Input, Row, Col, Modal, ModalFooter, Label,
  Container, Alert, Button, Table, ModalBody, ModalHeader, FormFeedback
} from 'reactstrap';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BakeryColor, BakeryFont } from '@barcode-bakery/barcode-react';
import { BakeryDatamatrix } from '@barcode-bakery/barcode-react/datamatrix';

function QRRapido() {
  var currentNull = {
    idQR: 0,
    descripcion: "",
    partNumber: "",
    quantity: "",
    poNumber: "",
    trace: "",
    serialNumber: "",
    timestamp: null,
    idUsuario: null
  }
  var hostapi = "http://localhost:5265";
  //var hostapi = "http://192.168.1.100:3000/polyempaques";

  const colorBlack = new BakeryColor(0, 0, 0);
  const colorWhite = new BakeryColor(255, 255, 255);

  const [modal, setModal] = useState(false);
  const [modalQR, setModalQR] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [modalProcesando, setModalProcesando] = useState(false);
  const [editarRegistro, setEditarRegistro] = useState(false);
  const [qrValue, setQrValue] = useState();
  const [descripcion, setDescripcion] = useState();
  const [qrs, setQrs] = useState([]);
  const [current, setCurrent] = useState(currentNull);
  const [descripcionInvalid, setDescripcionInvalid] = useState(false);
  const [partNumberInvalid, setPartNumberInvalid] = useState(false);
  const [quantityInvalid, setQuantityInvalid] = useState(false);
  const [poNumberInvalid, setPoNumberInvalid] = useState(false);
  const [serialNumberInvalid, setSerialNumberInvalid] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setCurrent({
      ...current,
      [name]: value.toUpperCase()
    });
  };

  const toggleEliminar = () => setModalEliminar(!modalEliminar);

  const toggle = () => {
    setCurrent(currentNull);
    setModal(!modal);
    setEditarRegistro(false);
  }

  const toggleProcesando = () => {
    setModalProcesando(!modalProcesando);
  }

  const toggleQR = () => setModalQR(!modalQR);

  const getQRs = () => {
    toggleProcesando()
    axios.get(`${hostapi}/api/QR`)
      .then(res => {
        setQrs(res.data)
        setModalProcesando(false)
      })
      .catch(err => {
        setModalProcesando(false)
        alert(`Error:\n${err}`)
      })
  }

  useEffect(() => {
    getQRs();
  }, [])

  const guardarEtiqueta = (e) => {
    e.preventDefault();

    setDescripcionInvalid(current.descripcion === "" ? true : false);
    setPartNumberInvalid(current.partNumber === "" ? true : false);
    setQuantityInvalid(current.quantity === "" ? true : false);
    setPoNumberInvalid(current.poNumber === "" ? true : false);
    setSerialNumberInvalid(current.serialNumber === "" ? true : false);
    if (
      current.descripcion !== ""
      && current.partNumber !== ""
      && current.quantity !== ""
      && current.poNumber !== ""
      && current.serialNumber !== ""
    ) {
      if (editarRegistro === false) {
        toggleProcesando()
        axios.post(`${hostapi}/api/QR`, current)
          .then(res => {
            if (res.data.status === "error") {
              alert(res.data.mensaje)
            }
            setModalProcesando(false)
            getQRs();
          })
          .catch(err => {
            setModalProcesando(false)
            alert(`Error:\n${err}`)
          })
        toggle();
      }
      else {
        toggleProcesando()
        axios.put(`${hostapi}/api/QR`, current)
          .then(res => {
            if (res.data.status === "error") {
              alert(res.data.mensaje)
            }
            setModalProcesando(false)
            getQRs();
          })
          .catch(err => {
            setModalProcesando(false)
            alert(`Error:\n${err}`)
          })
        toggle();
      }
    }
  }

  const qrView = (etiqueta) => {
    setDescripcion(etiqueta.descripcion);
    setQrValue(`P${etiqueta.partNumber},Q${etiqueta.quantity},K${etiqueta.poNumber},N${etiqueta.serialNumber}`);
    toggleQR();
  }

  const dlgEliminar = (etiqueta) => {
    setCurrent(etiqueta);
    toggleEliminar();
  }

  const eliminarRegistro = () => {
    axios.delete(`${hostapi}/api/QR/${current.idQR}`)
      .then(res => {
        if (res.data.status === "error") {
          alert(res.data.mensaje)
        }
        getQRs();
      })
      .catch(err => {
        alert(`Error:\n${err}`)
      })
    toggleEliminar();
  }

  const dlgEditar = (etiqueta) => {
    toggle();
    setCurrent(etiqueta);
    setEditarRegistro(true);
  }

  const imprimirEtiqueta = (etiqueta) => {
    toggleProcesando()
    var request = new Request(
      `${hostapi}/api/DocumentoPDF/GeneraEtiqueta`,
      {
        method: "post",
        body: JSON.stringify(etiqueta),
        headers: {
          'Content-Type': 'application/json'
        },
        mode: "cors",
        cache: "default",
      }
    );
    fetch(request)
      .then((response) => response.blob())
      .then((blob) => {
        const file = window.URL.createObjectURL(blob);
        setModalProcesando(false)
        window.open(file);
      })
      .catch((err) => {
        alert(`Error:\n${err}`);
      })
  }

  return (
      <>
        <Row>
          <Col xs="10">
            {/* <p style={{ textAlign: "left", fontSize: "2em" }}>Lista de etiquetas</p> */}
          </Col>
          <Col xs="2">
            <Button
              className="btnForm btn-block"
              type="button"
              color="primary"
              onClick={toggle}
            >
              <span className="fa-regular fa-clipboard"></span>
              Agregar etiqueta
            </Button>
          </Col>
        </Row>

        <hr />

        <Row>
          <Col xs="12">
            <Table striped>
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>Descripción</th>
                  <th style={{ width: "10%" }}>Part Number(P)</th>
                  <th style={{ width: "10%" }}>Quantity (Q)</th>
                  <th style={{ width: "10%" }}>PO Number (K)</th>
                  <th style={{ width: "10%" }}>Trace / Lot / Batch No. (T)</th>
                  <th style={{ width: "10%" }}>Serial Number (N)</th>
                  <th style={{ width: "10%" }}>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {qrs.map(etiqueta => {
                  return (
                    <tr key={etiqueta.idQR}>
                      <td style={{ textAlign: "left" }}>{etiqueta.descripcion}</td>
                      <td>{etiqueta.partNumber}</td>
                      <td>{etiqueta.quantity}</td>
                      <td>{etiqueta.poNumber}</td>
                      <td>{etiqueta.trace}</td>
                      <td>{etiqueta.serialNumber}</td>
                      <td>{etiqueta.timestamp}</td>
                      <td>
                        <Button color="secondary" type="button" onClick={() => qrView(etiqueta)}>
                          <span className="fa-solid fa-qrcode"></span>
                        </Button>
                        <Button color="primary" type="button" onClick={() => dlgEditar(etiqueta)}>
                          <span className="fa-solid fa-pencil"></span>
                        </Button>
                        <Button color="success" type="button" onClick={() => imprimirEtiqueta(etiqueta)}>
                          <span className="fa-solid fa-print"></span>
                        </Button>
                        <Button color="danger" type="button" onClick={() => dlgEliminar(etiqueta)}>
                          <span className="fa-solid fa-xmark"></span>
                        </Button>
                      </td>
                    </tr>
                  )
                })
                }
              </tbody>
            </Table>
          </Col>
        </Row>

        <Modal
          isOpen={modal}
          toggle={toggle}
          backdrop="static"
        >
          <Form onSubmit={guardarEtiqueta}>
            <ModalHeader toggle={toggle}>{editarRegistro ? "Editar registro." : "Nuevo registro."}</ModalHeader>
            <ModalBody>
              <Alert color="warning">
                <h5>
                  Los campos marcados con * son requeridos.
                </h5>
              </Alert>
              <FormGroup>
                <Label>Descripción<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type='text'
                  placeholder='Ej: ROLLO XYZ'
                  name="descripcion"
                  value={current.descripcion}
                  onChange={onChange}
                  invalid={descripcionInvalid}
                />
                <FormFeedback>Campo requerido.</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label>Part Number (P)<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type='text'
                  placeholder='Ej: 50455543'
                  name="partNumber"
                  value={current.partNumber}
                  onChange={onChange}
                  invalid={partNumberInvalid}
                />
                <FormFeedback>Campo requerido.</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label>Quantity (Q)<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type='text'
                  placeholder='Ej: 508'
                  name="quantity"
                  value={current.quantity}
                  onChange={onChange}
                  invalid={quantityInvalid}
                />
                <FormFeedback>Campo requerido.</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label>PO Number (K)<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type='text'
                  placeholder='Ej: 4511521342'
                  name="poNumber"
                  value={current.poNumber}
                  onChange={onChange}
                  invalid={poNumberInvalid}
                />
                <FormFeedback>Campo requerido.</FormFeedback>
              </FormGroup>
              <FormGroup>
                <Label>Trace / Lot / Batch No. (T)</Label>
                <Input
                  type='text'
                  placeholder=''
                  disabled
                />
              </FormGroup>
              <FormGroup>
                <Label>Serial Number (N)<span style={{ color: "red" }}>*</span></Label>
                <Input
                  type='text'
                  placeholder='Ej: DJ00000001'
                  name="serialNumber"
                  value={current.serialNumber}
                  onChange={onChange}
                  invalid={serialNumberInvalid}
                />
                <FormFeedback>Campo requerido.</FormFeedback>
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" type="button" onClick={toggle}>
                <span className="fa-solid fa-xmark"></span>
                Cerrar
              </Button>
              <Button color="success" type="submit">
                <span className="fa-regular fa-save"></span>
                Guardar
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
        <Modal
          isOpen={modalQR}
          toggle={toggleQR}
        >
          <ModalHeader>
            {descripcion}
          </ModalHeader>
          <ModalBody>
            <p style={{ textAlign: 'center' }}>
              {/* <QRCode
                size={150}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={qrValue}
                viewBox={`0 0 150 150`}
              /> */}
              <BakeryDatamatrix
                scale={10}
                foregroundColor={colorBlack}
                backgroundColor={colorWhite}
                text={qrValue}
              />
              <br />
              {qrValue}
            </p>

          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={toggleQR}>
              <span className="fa-solid fa-xmark"></span>
              Cerrar
            </Button>
          </ModalFooter>
        </Modal>
        <Modal
          isOpen={modalEliminar}
          toggle={toggleEliminar}
        >
          <ModalHeader>
            Eliminar etiqueta.
          </ModalHeader>
          <ModalBody>
            ¿Realmente deseas eliminar el registro de la etiqueta: {current.descripcion}?
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={toggleEliminar}>
              No
            </Button>
            <Button color="success" type="button" onClick={() => eliminarRegistro()}>
              Si
            </Button>
          </ModalFooter>
        </Modal>
        <Modal
          isOpen={modalProcesando}
          toggle={toggleProcesando}
          size="sm"
          backdrop="static"
        >
          <ModalBody>
            <p style={{ textAlign: "center" }}>
              <img src={loader} width="50%" height="100%" />
            </p>
          </ModalBody>
        </Modal>
      </>
  );
}

export default QRRapido;
