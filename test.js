'use strict';

const api = require('cirrus-api-postgresql-accelerator');
const { ApiError } = api;
const { logger } = global;

const fullCertificateMapping = {
    id: 'id',
    saveDate: 'save_date',
    user: 'user_ldap',
    certificateAsJson: 'certificate',
    certificateAsJsonBinary: 'certificateb',
};

const certificateHeaderMapping = {
    id: 'id',
    saveDate: 'save_date',
    user: 'user_ldap',
    batchNumber: 'batch_number',
    site: 'site',
    materialNumber: 'material_number',
    countries: 'country_list',
};

const sqlGetHeaders = `SELECT * FROM (SELECT
    id,
    save_date,
    user_ldap,
    batch_number,
    site,
    material_number,
    string_agg(country, ', ') as country_list
FROM (SELECT
    id,
    save_date,
    user_ldap,
    certificate -> 'batches' -> 0 ->> 'number' as batch_number,
    certificate -> 'batches' -> 0 -> 'productionSite' ->> 'name' as site,
    certificate -> 'batches' -> 0 -> 'material' ->> 'reference' as material_number,
    json_array_elements(case when (certificate -> 'markets')::text = '[]' then '[{"name":""}]'::json else (certificate -> 'markets') end) ->> 'name' as country
FROM coa.coa_certificates) f GROUP BY id, save_date, user_ldap, batch_number, site, material_number) f ORDER BY id DESC`;

const sqlInsertCertificate = `INSERT INTO coa.coa_certificates
        (save_date, user_ldap, certificate, certificateb)
        VALUES ($1::date, $2::text, $3::json, $4::jsonb);`;

const sqlGetCertificate = `SELECT * FROM coa.coa_certificates WHERE id = $1::int`;

const selectCertificate = function(request, response) {
    try {
        if (request != null) {
            const dtStart = new Date();
            var oa = new api.PostgreSqlAccelerator(
                request,
                fullCertificateMapping,
                null,
                sqlGetCertificate
            );
            const params = [request.swagger.params.id.value];
            oa.executeQuery(params, response)
                .then(() => {
                    const dtEnd = new Date();
                    const diff = (dtEnd - dtStart) / 1000;
                    logger.info(
                        `${oa.correlationId} | certificate-controller.js selectCertificate() Call time elapsed: ${diff} seconds`
                    );
                })
                .catch((err) => {
                    /* istanbul ignore next */
                    if (err instanceof ApiError) {
                        api.getErrorResponse(response, err.getObject());
                    } else {
                        const aErr = new ApiError(err);
                        api.getErrorResponse(response, aErr.getObject());
                    }
                });
        }
    } catch (err) {
        /* istanbul ignore next */
        if (err instanceof ApiError) {
            api.getErrorResponse(response, err.toString());
        } else {
            const aErr = new ApiError(err);
            api.getErrorResponse(response, aErr.toString());
        }
    }
};

const selectHeaders = function(request, response) {
    try {
        if (request != null) {
            const dtStart = new Date();
            var oa = new api.PostgreSqlAccelerator(
                request,
                certificateHeaderMapping,
                null,
                sqlGetHeaders
            );
            oa.executeQuery(null, response)
                .then(() => {
                    const dtEnd = new Date();
                    const diff = (dtEnd - dtStart) / 1000;
                    logger.info(
                        `${oa.correlationId} | certificate-controller.js selectHeaders() Call time elapsed: ${diff} seconds`
                    );
                })
                .catch((err) => {
                    /* istanbul ignore next */
                    if (err instanceof ApiError) {
                        api.getErrorResponse(response, err.getObject());
                    } else {
                        const aErr = new ApiError(err);
                        api.getErrorResponse(response, aErr.getObject());
                    }
                });
        }
    } catch (err) {
        /* istanbul ignore next */
        if (err instanceof ApiError) {
            api.getErrorResponse(response, err.toString());
        } else {
            const aErr = new ApiError(err);
            api.getErrorResponse(response, aErr.toString());
        }
    }
};

const insertCertificate = function(request, response) {
    try {
        /* istanbul ignore else */
        if (request != null) {
            const dtStart = new Date();
            var oa = new api.PostgreSqlAccelerator(
                request,
                {},
                null,
                sqlInsertCertificate
            );
            const params = [
                request.body.saveDate,
                request.body.user,
                request.body.certificateAsJson,
                request.body.certificateAsJson,
            ];
            oa.executeQuery(params, response)
                .then(() => {
                    const dtEnd = new Date();
                    const diff = (dtEnd - dtStart) / 1000;
                    logger.info(
                        `${oa.correlationId} | certificate-controller.js insertCertificate() Call time elapsed: ${diff} seconds`
                    );
                })
                .catch((err) => {
                    /* istanbul ignore next */
                    if (err instanceof ApiError) {
                        api.getErrorResponse(response, err.toString());
                    } else {
                        const aErr = new ApiError(err);
                        api.getErrorResponse(response, aErr.toString());
                    }
                });
        }
    } catch (err) {
        /* istanbul ignore next */
        if (err instanceof ApiError) {
            api.getErrorResponse(response, err.toString());
        } else {
            const aErr = new ApiError(err);
            api.getErrorResponse(response, aErr.toString());
        }
    }
};

/**
 * @module publication-controller
 * @description This controller shows how to use the manual query functionality.<br/>
 * This functionality requires the demo table to be installed.<br/><br/>
 * Exports: TODO
 * <ul><li>[selectAll method]{@link module:template-controller.selectAll} - A method that gets all records from the table.</li>
 */
module.exports = {
    selectHeaders,
    insertCertificate,
    selectCertificate,
};
