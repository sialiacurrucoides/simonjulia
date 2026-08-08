---
title: "Monitoring with Grafana"
description: "Ideally, we want to be notified of a potential crash or slowdown before user complaints come in. With Grafana, we can visualize our data collected from various sources and set up notifications for critical changes."
date: 2026-08-08
tags: ["backend", "DevOps"]
---

<figure class="diagram3 grafanaDiagram">
  <picture>
    <source media="(max-width: 600px)" srcset="/grafana_dashboard_mobile.webp" />
    <img src="/grafana_dashboard.webp" alt="Grafana panelek" width="900" height="339" loading="lazy" />
  </picture>
  <figcaption>Grafana panelek</figcaption>
</figure>

<br>

## What Kind of Software Is Grafana?

Grafana is an open-source software for visualizing data that can be run on our own infrastructure. There is also a Cloud version, which is maintained by a service provider and, naturally, comes with a cost above a certain amount of data usage.

Grafana primarily displays data queried from data sources and stores the configuration required for the visualization and its operation. The data can be provided by Prometheus (also open source), Amazon CloudWatch, an SQL server, etc.

Grafana itself is not a monitoring system. It is a visualization and observability platform that connects to various data sources.

<br>

## How to Use It

Different versions have different interfaces; here I will follow the layout of version v12.4.8.

After the first login, it is definitely worth changing the password because of the default administrator credentials.

First, we need to configure a data source. This can be done under **Connections** > **Add new connection**. For example, we can select Prometheus if that is what collects our data.  

### Creating a Dashboard

We can start from the Dashboards menu. In the top-right corner, we find the **New** button. Opening it and selecting **New dashboard** takes us to a page where we can either import a previously created JSON file (for example, one versioned in our codebase) or create our first visualization.

Before committing to a particular visualization, we can try out the metric on the **Explore** page. To do this, we need to enter the name of the Prometheus metric we want to measure, or a complete expression containing multiple metrics, in the **Metric browser** field. For example:

```
(1 - node_memory_SwapFree_bytes / node_memory_SwapTotal_bytes) * 100
```

We can then run the query by clicking **Run query**, and Grafana will display the result as a visualization.

### Creating a Panel

Once we are happy with our query, we can click **Edit** on our dashboard and open the **Add** dropdown, where we can find the **Visualization** option.

This opens the visualization editor. Here, we again enter our expression in the **Metric browser**. Below it, we can configure the label, format, type, and other properties.

On the right-hand side, we can select the type of visualization we need: a histogram, table, single value, and so on.

Once this is done, clicking the **Back** button takes us to the basic settings, where we can specify the panel title and, further down, the unit, minimum value, and maximum value.

Once everything is configured, we should not forget to save the result using the save button in the top-right corner.

### Configuring Alerts

Under the **Alerting** menu, the **Contact points** page allows us to configure which service should be used to deliver notifications.

The configured service can then be selected under **Notification policies**, where we can define when and how often notifications should be sent if an alert rule is triggered.

The rules themselves can be configured on the **Alert rules** page.

<br>

Both alert rules and panels can be exported, making it easier to reuse them later.

<br>

## What Can We Use It For?

Collecting, storing, and processing data comes with some cost, so as much as we may like colorful charts, there is usually a well-defined reason why we monitor something.

### Capacity Monitoring

Even if we hope to eventually have a huge user base, during the idea-validation phase of an application, when we only have to deal with a few users and there is a significant chance that the first version will not be viable, running infrastructure designed for millions of users would be a massive waste of money.

Typically, we start with a simpler architecture and smaller infrastructure. However, to avoid unpleasant surprises when a growing user base starts putting more load on the system, it is worth monitoring the capacity of our infrastructure.

We can configure an alert for when memory usage reaches a certain limit and it becomes necessary to scale the system.

Prometheus cannot obtain information about the system state of a server on its own, so we need a separate exporter. One example is the Go-based **Node Exporter**.

It is a stateless exporter that makes metrics from the Linux system and its various components available in a form that Prometheus can query over HTTP.

Prometheus sends *pull* requests to the exporter at regular intervals, and the exporter responds with the current metrics.

Although newer versions provide various authentication options, it is still not a good idea to expose its port directly to the outside world when there is no need to do so.

It is also worth keeping the software up to date with security patches, because malicious code can effectively be handed information about when our system is most vulnerable. The same applies to Prometheus, which also contains historical data about peak periods.

<br>

Examples of capacity metrics:

#### RAM Headroom

We can fit a straight line to the memory usage of the last six hours and project what will happen 24 hours later.

If the value approaches zero, we are approximately one day away from reaching our memory limit.

This is, of course, only a simple estimate: if memory usage does not grow approximately linearly, the prediction can easily be misleading. It is not sufficient for exponential growth.

#### SWAP Used

Swap is an area reserved on storage that the operating system can use as part of its virtual memory system. In many cases, we have to initialize it on our server ourselves.

Significant or continuous swap usage can indicate memory pressure or insufficient memory, but using swap by itself does not mean that the system has too little RAM.

A deployment can easily increase swap usage without this meaning that there is not enough RAM during normal operation.

Looking at the absolute value together with the other metrics can help us interpret the situation. If the value is not high and the memory metrics all return to their previous levels after a deployment, there may be nothing to do yet.

#### Load Average

Load average describes the average number of processes that are running or waiting to run. On Linux, processes waiting on certain I/O operations can also contribute to the load, so this metric can be high even when the CPU itself is not heavily utilized.

#### Memory Pressure (PSI)

The Linux equivalent of a pain receptor: it measures how much time processes spend waiting for memory resources during a given interval.

By calculating the ratio, we can determine how much time is being lost.

While **Free RAM** tells us how much free capacity is available, this metric tells us whether the current level is actually causing problems.

<br>

### Cache Planning

We introduce a cache layer when we want to improve performance by serving frequently requested data from memory (RAM).

RAM is naturally a limited resource, and cache invalidation logic can also be a significant source of painful bugs.

It is therefore better not to decide what goes into the cache based on guesswork.

Before performance problems occur, we can monitor the traffic of potential endpoints and estimate what cache hit rate we could achieve with a given expiration time (TTL).

<br>

### Monitoring the Impact of a Deployment

Even with thorough local testing, it can be difficult to predict how a newly deployed change will affect our infrastructure when we have a larger user base.

One valid strategy is to monitor the system metrics during a deployment and check whether any spikes return to their previous levels.

Does the latency of requests change permanently? Does CPU or RAM usage remain higher than before?

<br>

### Tracking Business-Critical Metrics

At various relevant stages of backend processes, we can record internal metrics that have nothing to do with external service providers.

We can track these values in Grafana in the same way as system health metrics.

For example:

* total number of sales
* number of refunds
* total sales value
* refund rate
* conversion rate
* most popular payment method
* abandoned payments
* average basket value
* number of registrations
* and so on

<br>

## Conclusion

Sometimes it is true that we can really control what we measure.

Of course, this does not mean that having numbers eliminates the need for domain knowledge, professional intuition, or empathy.

However, when we do not even have numbers, we are flying more or less blind, and the chances of failure are higher.

Grafana is a popular platform for monitoring and visualizing data, but it is certainly not the only one.

The important thing is to find the tools that allow us to keep things under control.
